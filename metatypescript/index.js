var ts = require("typescript");
var process = require("process");
var fs = require("fs");
var path = require("path");
var colors = require('colors');
var chokidar = require('chokidar');

const EventEmitter = require('events');
const util = require('util');

var configFilename = "metatypescript.json";
var config;
if(process.argv.length>2)
{
    configFilename = process.argv[2];
}


function Debug()
{

}
Debug.inspect = function(object, level)
{
    var str = "";
    if(level === undefined)
    {
        level = 0;
    }
    for(var i=0; i<level; i++)
    {
        str += "\t";
    }
    for(var p in object)
    {
        if(typeof object[p] == "function")
        {
            if(p.substring(0, 3) == "get")
            {
                console.log(str+colors.red(p));
            }else
            {
                console.log(str+colors.cyan(p));
            }
        }else
        {
            console.log(str+p);
            if(object[p] && typeof object[p] == "object" && level<10)
            {
                Debug.inspect(object[p], level+1);
            }
            if(level >=10)
            {
                console.log(colors.red("too deep"));
            }
        }
    }
};

function die(message)
{
    console.error(colors.red("FATAL"));
    console.error(message);
    process.exit(1);
}


function MetaCompiler()
{
    this.configuration = null;
    this.folders = [];
    this.modules = {};
    this.rootDir = ".";
    this.watchers = [];
}
MetaCompiler.prototype.config = function(filename, callback)
{
    if(!callback)
    {
        callback = die;
    }

    fs.stat(configFilename, (error, file)=>{
        if(error)
            return callback(error);
        fs.readFile(configFilename, {encoding:'utf8', flag:'r'}, (error, data)=>{
            if(error)
                return callback(error);

            try {
                this.configuration = JSON.parse(data);
                if(!this.configuration)
                {
                    return callback("Configuration file is empty");
                }
                this.rootDir = path.dirname(path.resolve(configFilename));
                return callback(null, data);
            }catch(error)
            {
                return callback(error);
            }
        });
    });

};

MetaCompiler.prototype.init = function()
{

    process.chdir(this.rootDir);
    this.parseConfigFile();
    this.startWatching();
};
MetaCompiler.prototype.parseConfigFile = function()
{
    this.folders = this.configuration.folders || [];
    this.folders.map(function(folder)
    {
        return path.resolve(this.rootDir, folder);
    }, this);

};

MetaCompiler.prototype.startWatching = function()
{
    this.folders.forEach(function(folder)
    {
        var watcher;
        this.watchers.push(watcher = chokidar.watch( path.join(folder, "**/*.ts"), {
            ignored: /[\/\\]\./, persistent: true
        }));

        var events = ['add','addDir','change','unlink','unlinkDir','error','ready','raw'];
        var event, func;
        for(var p in events)
        {
            event = events[p];
            func = this["onWatcher"+event.substring(0, 1).toUpperCase()+event.substring(1)];
            if(func)
            {
                if(event == "ready")
                {
                    watcher.on(event, func.bind(this, folder, watcher));
                }else
                {
                    watcher.on(event, func.bind(this, folder));
                }
            }
            else
            {

                watcher.on(event, this.onWatcherEvent.bind(this, folder, event));
            }
        }
    }, this);

};
MetaCompiler.prototype.getModule = function(folder, file)
{
    var relative = path.dirname(path.relative(folder, file));
    var module = this.modules[relative];
    if(!module)
    {
        this.modules[relative] = new Module(folder, relative);
        this.modules[relative].once(Module.EVENT_READY, this.onModuleReady.bind(this, this.modules[relative]));
    }
    if(this.modules[relative].folder != folder)
    {
       return die(colors.cyan(this.modules[relative].folder)+ " and "+ colors.cyan(folder)+ " have both module "+ colors.red(relative)+ " it is not currently supported");
    }
    return this.modules[relative];
};
MetaCompiler.prototype._checkIsReady = function()
{

    //TODO:remove module that doesn't succeed each task
    var errors;
    for(var p in this.modules)
    {
       if((errors = this.modules[p].getCompiler().compileSyntax())!==true)
       {
           return this.displayErrors(errors);
       }
    }
    for(var p in this.modules)
    {
        if((errors = this.modules[p].getCompiler().compileParse())!==true)
        {
            return this.displayErrors(errors);
        }
    }
    //TODO:WARNING DONT EDIT dependencies for file/module when sorting use temp array orderFiles/orderModules
    for(var p in this.modules)
    {
        if((errors = this.modules[p].orderFiles())!==true)
        {
            return this.displayErrors(errors);
        }
    }

    this.orderModules();

    for(var p in this.ordonnedModules)
    {
        if((errors = this.ordonnedModules[p].calculModulesDependencies())!==true)
        {
            return this.displayErrors(errors);
        }
    }
    //TODO:ici on peut rajouter les modules externes + lib

    //first compilation without displaying errors
    for(var p in this.ordonnedModules)
    {
        if((errors = this.ordonnedModules[p].getCompiler().compileOutput())!==true)
        {
          //  return this.displayErrors(errors);
        }
    }
    for(var p in this.ordonnedModules)
    {
        if((errors = this.ordonnedModules[p].generateDeclarationOutput())!==true)
        {
            return this.displayErrors(errors);
        }
    }
    for(var p in this.ordonnedModules)
    {
        if((errors = this.ordonnedModules[p].generateContentOutput())!==true)
        {
            return this.displayErrors(errors);
        }
    }
    for(var p in this.ordonnedModules)
    {
        if((errors = this.ordonnedModules[p].addDependencies())!==true)
        {
            return this.displayErrors(errors);
        }
    }
    for(var p in this.ordonnedModules)
    {
        if((errors = this.ordonnedModules[p].getCompiler().compileOutput())!==true)
        {
              return this.displayErrors(errors);
        }
    }
    if(this.configuration.out)
    {
        for(var p in this.configuration.out)
        {
            if(this.modules[p])
            {
                console.log(colors.green("Writing "+this.configuration.out[p]));
                fs.writeFileSync(this.configuration.out[p], this.modules[p].getFullOutput(true), 0, "utf-8");
            }
        }
    }
    //this.modules["level/data"].compile();
};
MetaCompiler.prototype.orderModules = function()
{
    var modules = [];
    for(var p in this.modules)
    {
        modules.push(this.modules[p]);
        this.modules[p].tmpDependencies = this.modules[p].dependencies.slice();
    }

    console.log(colors.red("premodules"));
    console.log(modules);
    //for test only
    modules.reverse();
    var i = 0, j;
    var currentInterns = [];
    var dependency, isFound;
    var first, module;
    var len = modules.length;
    //define writing order
    while(i<len)
    {
        module = modules[i];
        j = module.tmpDependencies.length;
        console.log(colors.green(j));
        while(j>0)
        {
            dependency = module.tmpDependencies[j-1];
            isFound = false;
            for(var k=0; k<currentInterns.length; k++)
            {
                if(Compiler.isInstanceOf(dependency, currentInterns[k]))/*dependency.namespace+'/'+dependency.value == currentInterns[k].namespace+'/'+currentInterns[k].value || dependency.value == currentInterns[k].namespace+'/'+currentInterns[k].value)*/ {
                    isFound = true;
                    break;
                }
            }
            if(isFound)
            {
                module.tmpDependencies[j-1].module =  currentInterns[k].module;
                module.tmpDependencies.pop();
                j--;
            }else
            {
                console.log("not found:", dependency);
                //dendency not satisfated
                break;
            }
        }

        if(!module.tmpDependencies.length)
        {
            i++;
            first = null;
            currentInterns = currentInterns.concat(module.interns);
            console.log("ok:", module);
        }else
        {
            console.log("not:", module);
            if(module === first)
            {
                var f = modules.slice(i);
                for(var p in f)
                {
                    console.log(colors.cyan(f[p].inspect()));
                }
                return [{error:new Error("Cyclic dependencies"), files:modules.slice(i)}];
            }
            modules.splice(i, 1);
            modules.push(module);
            if(!first)
            {
                first = module;
            }
        }
    }

    this.ordonnedModules = modules;
    console.log(colors.red("MODULES"));
    console.log(modules);

};

MetaCompiler.prototype.displayErrors = function( files)
{

    var file;
    for(var p in files)
    {
        file = files[p];
        if(!file.diagnostics || !file.diagnostics.length)
        {
            if(!file.error)
            {
                console.log(colors.red("error ignored"));
                continue;
            }
            console.log(colors.red(file.error.toString()));
            if(file.files)
            {
                for(var i=0; i<file.files.length; i++)
                {
                    console.log( colors.red(file.files[i].inspect()));
                }
            }
            continue;
        }
        for(var i=0; i<file.diagnostics.length; i++)
        {
            position = ts.getLineAndCharacterOfPosition(file.source, file.diagnostics[i].start);
            console.log( colors.red(file.file+"("+(position.line+1)+","+(position.character+1)+"): "+file.diagnostics[i].error_type+" error T"+file.diagnostics[i].code+": "+file.diagnostics[i].messageText));
        }
    }
};
MetaCompiler.prototype.onModuleReady = function(module)
{
    for(var p in this.modules)
    {
        if(!this.modules[p].ready)
        {
            return;
        }
    }
    this._checkIsReady();
};

MetaCompiler.prototype.onWatcherEvent = function(folder, event, path)
{
    console.log("on unwatched event :", event, path);

};
MetaCompiler.prototype.onWatcherReady = function(folder, watcher)
{
    watcher.ready = true;

    if(this.watchers.length != this.folders.length)
    {
        return;
    }
    for(var p in this.watchers)
    {
        if(!this.watchers[p].ready)
        {
            return;
        }
    }

    //all watchers ready

    for(var p in this.modules)
    {
        this.modules[p].init();
    }

};
MetaCompiler.prototype.onWatcherAdd = function(folder, path)
{
    var module = this.getModule(folder, path);
    module.addFile(path);
};
MetaCompiler.prototype.onWatcherChange = function(folder, path)
{
    console.log(colors.cyan(folder)+ " "+colors.cyan(path));
    var module = this.getModule(folder, path);
    if(!module)
    {
        return;
    }
    var file = module.getFile(path);
    if(!file)
    {
        return;
    }
    file.invalidate();
    module.invalidate();
    module.compile();
};


MetaCompiler.prototype.compile = function()
{

};


function Module(folder, pathModule, compiler)
{
    EventEmitter.call(this);
    /**
     * Root folder of module
     */
    this.folder = folder;
    /**
     * Module's name
     */
    this.path = pathModule;
    /**
     * Compiler
     */
    this.compiler = compiler;
    /**
     * Module's files
     * @type {Array}
     */

    this.tsConfigFilename = path.join(this.folder, this.path, "tsconfig.json");
    this.tsConfig = {
        files:[],
        version:0,
        compilerOptions:
        {
            declaration:true
        }
    };

    this.tsConfigInvalidated = true;
    this.tsConfigInvalidating = false;

    this.ready = false;

    //compiler
    this.compiler = null;
    this.compiled = false;

    this.files = {};

    //this.declarationFile = new DeclarationFile();
}
Module.EVENT_READY = "module_event_ready";

Module.prototype.inspect = function()
{
    var dep;
    if(this.dependencies)
    {
        dep = this.dependencies.map(function(item)
        {
            return item.module?item.module.path:'Unkown module';
        });
    }
    return "[Module name=\""+this.path+"\" files=\""+this.tsConfig.files.length+"\" depencies=\""+(this.dependencies?this.dependencies.length:0)+"\"]"+(dep?dep.join('\n'):'');
};
Module.prototype.init = function()
{

    fs.readFile(this.tsConfigFilename,  {encoding:'utf8', flag:'r'}, (error, data)=>
    {
        this.tsConfigInvalidated = false;

        if(error)
        {
            // no file
        }else
        {
            try
            {
                var config = JSON.parse(data);
                for(var p in config)
                {
                    if(p != "files")
                    {
                        this.tsConfig[p] = config[p];
                    }
                }
                if(config.files)
                {
                    if(config.files.length != this.tsConfig.files.length)
                    {
                        this.tsConfigInvalidated = true;
                    }else {
                        this.tsConfig.files.sort();
                        config.files.sort();
                        var len = this.tsConfig.files.length;
                        for(var i = 0; i<len; i++ )
                        {
                            if(config.files[i] != this.tsConfig.files[i])
                            {
                                this.tsConfigInvalidated = true;
                                break;
                            }
                        }
                    }

                }else
                {
                    this.tsConfigInvalidated = true;
                }


            }catch(error)
            {
                console.warn(colors.magenta(this.tsConfigFilename+ " is corrupted - ignoring it"));

            }
        }
        if(!this.tsConfig.compilerOptions)
        {
            //TODO:compare compiler options meta compiler options - merge
            this.tsConfig.compilerOptions = {};
            this.tsConfigInvalidated = true;
        }
        this.onInitialized();
    });
};
Module.prototype.onInitialized = function()
{

    if(this.tsConfigInvalidated)
    {
        this.syncTsConfig(this.onPreReady.bind(this));
    }else
    {
        this.onPreReady();
    }
};
Module.prototype.onPreReady = function()
{
    for(var p in this.tsConfig.files)
    {
        this.files[this.tsConfig.files[p]] = new File(path.join(this.folder, this.path), this.tsConfig.files[p]);
        this.files[this.tsConfig.files[p]].on(File.EVENT_READY, this.onFileReady.bind(this, this.files[this.tsConfig.files[p]]));
        this.files[this.tsConfig.files[p]].on(File.EVENT_PARSED, this.onFileParsed.bind(this, this.files[this.tsConfig.files[p]]));
        this.files[this.tsConfig.files[p]].init();
    }
};
Module.prototype.onFileReady = function(file, data)
{
    for(var p in this.tsConfig.files)
    {
        if(!this.files[this.tsConfig.files[p]].ready)
        {
            return;
        }
    }
    this.onReady();
};
Module.prototype.onFileParsed = function(file, data)
{

};
Module.prototype.onReady = function()
{
    this.ready = true;

    this.emit(Module.EVENT_READY);
};
Module.prototype.addFile = function(file)
{
    file = path.relative(this.path, path.relative(this.folder, file));
    if(this.tsConfig.files.indexOf(file) == -1)
    {
        this.tsConfig.files.push(file);
    }else
    {
        console.warn("File already into module: ",file, " into ",+this.folder);
    }
    //console.log("add ", file," into ", this.path, " (",this.folder+")");
};
Module.prototype.hasFile = function(file)
{
    return this.files[file] != null;
};
Module.prototype.getFile = function(file)
{
    if(this.files[file])
    {
        return this.files[file];
    }
    console.log(colors.green(file));
    console.log(this.files);

    if(this.useDependencies)
    {
        for(var p in this.dependenciesModules)
        {
            if( this.dependenciesModules[p].getDeclarationFile().file == file)
            {
                return this.dependenciesModules[p].getDeclarationFile();
            }
        }
    }

    file = path.relative(this.path, path.relative(this.folder, file));
    if(this.files[file])
    {
        return this.files[file];
    }

    return null;
};
Module.prototype.syncTsConfig = function(callback)
{
    if(!this.tsConfigInvalidating && this.tsConfigInvalidated)
    {
        this.tsConfigInvalidated = false;
        this.tsConfig.version++;
        fs.writeFile(this.tsConfigFilename, JSON.stringify(this.tsConfig), {encoding:"utf8", flag:'w'}, (error, data)=>
        {
            if(error)
            {
                this.tsConfigInvalidated = true;
                this.tsConfigInvalidating = false;
                console.warn(colors.magenta(this.tsConfigFilename+": failed to write"));
                return this.syncTsConfig(callback);
            }
            this.tsConfigInvalidating = false;
            if(this.tsConfigInvalidated)
            {
                //invalidated between
                return this.syncTsConfig(callback);
            }
            if(callback)
            {
                callback();
            }

        });
    }
};
Module.prototype.getCompiler = function()
{
    if(!this.compiler)
    {
        this.compiler = new Compiler(this, this.tsConfig);
        this.compiler.init();
    }
    return this.compiler;
}
Module.prototype.compile = function()
{
    if(!this.compiler)
    {
        this.compiler = new Compiler(this, this.tsConfig);
        this.compiler.init();
    }
    else
    if(!this.compiled)
    {
        this.compiler.compile();
    }
};
Module.prototype.invalidate = function()
{
    this.compiled = false;
};
Module.prototype.updateContent = function()
{
    var files = this.files_order;
    var content = "", declarationContent = "";
    for(var i =0; i<files.length; i++)
    {
        declarationContent+= files[i].declarationResult;
        content+= files[i].jsResult;
    }
    this.declarationFile.setContent(content);
    this.declarationFile.setDeclarationContent(declarationContent);
};
Module.prototype.getDeclarationFile = function()
{
    if(!this.declarationFile)
    {
        this.declarationFile = new ModuleFile("module_"+this.path.replace(/\//g,'_')+".d.ts");
    }
    return this.declarationFile;
};
function ModuleFile(name)
{
    this.declarationContent;
    this.content;
    this.file = name;
    console.log(colors.red("name:")+colors.cyan(name));
    this.version = 0;
}
ModuleFile.prototype.setContent = function(content)
{
    this.content = content;
};
ModuleFile.prototype.getContent = function()
{
    return this.content?this.content:"";
};
ModuleFile.prototype.setDeclarationContent = function(content)
{
    if(this.declarationContent != content)
    {
        this.declarationContent = content;
        this.snapshot = ts.ScriptSnapshot.fromString(this.declarationContent);
        this.version++;
    }
};
ModuleFile.prototype.getDeclarationContent = function()
{
    return this.declarationContent?this.declarationContent:"";
};
ModuleFile.prototype.getSnapShot = function()
{
    console.log(colors.red("GET CONTENT:")+this.declarationContent);
    return this.snapshot?this.snapshot:ts.ScriptSnapshot.fromString("");
};
Module.prototype.orderFiles = function()
{
    var file;
    var interns = [];
    var dependencies = [];
    var used = [];
    for(var p in this.compiler.files)
    {
        file = this.compiler.files[p];
        if(!file.isValidParsed())
        {
            return [{error:new Error("all files must be parsed"), files:[file]}];
        }
        //   console.log(file.parseInformation);
        interns = interns.concat(file.parseInformation.intern);
        dependencies = dependencies.concat(file.parseInformation.dependencies);
        used = used.concat(file.parseInformation.used);
        //  console.log(p+":"+this.files[p].jsResult.length );
    }

    var files = [];
    for(var p in this.compiler.files)
    {
        files.push(this.compiler.files[p]);
    }
    //for test only
    //files.reverse();


    var lenIntern = interns.length;
    files.forEach(function(file)
    {
        var len = file.parseInformation.dependencies.length;
        file.parseInformation.dependenciesInterns = [];
        file.parseInformation.dependenciesExterns = [];
        var used, intern, isIntern;
        for(var i = 0; i<len; i++)
        {
            used = file.parseInformation.dependencies[i];
            isIntern = false;
            for(var j=0; j<lenIntern; j++)
            {
                intern = interns[j];
                if(Compiler.isInstanceOf(used, intern))/*used.namespace+'/'+used.value == intern.namespace+'/'+intern.value || used.value == intern.namespace+'/'+intern.value)*/ {
                    isIntern = true;
                    break;
                }
            }
            if(isIntern)
            {
                file.parseInformation.dependenciesInterns.push(used);
            }else
            {
                file.parseInformation.dependenciesExterns.push(used);
            }
        }
        return file;
    });

    var len = files.length;
    var i = 0, j;
    var currentInterns = [];
    var dependency, isFound;
    var first;
    //define writing order
    while(i<len)
    {
        file = files[i];
        console.log("test:", file);
        j =  file.parseInformation.dependenciesInterns.length;
        while(j>0)
        {
            dependency = file.parseInformation.dependenciesInterns[j-1];
            isFound = false;
            for(var k=0; k<currentInterns.length; k++)
            {
                if(Compiler.isInstanceOf(dependency, currentInterns[k]))/*dependency.namespace+'/'+dependency.value == currentInterns[k].namespace+'/'+currentInterns[k].value || dependency.value == currentInterns[k].namespace+'/'+currentInterns[k].value)*/ {
                    isFound = true;
                    break;
                }
            }
            if(isFound)
            {
                file.parseInformation.dependenciesInterns.pop();
                j--;
            }else
            {
                console.log("not found:", dependency);
                //dendency not satisfated
                break;
            }
        }
        if(!file.parseInformation.dependenciesInterns.length)
        {
            i++;
            first = null;
            currentInterns = currentInterns.concat(file.parseInformation.intern);
            console.log("ok:", file);
        }else
        {
            console.log("not:", file);
            if(file === first)
            {
                var f = files.slice(i);
                for(var p in f)
                {
                    console.log(colors.cyan(f[p].file));
                    console.log(f[p].parseInformation);
                }
                return [{error:new Error("Cyclic dependencies"), files:files.slice(i)}];
            }
            files.splice(i, 1);
            files.push(file);
            if(!first)
            {
                first = file;
            }
        }
    }
    //extern dependencies
    dependencies = [];
    for(var i=0; i<files.length; i++)
    {
        file = files[i];
        if(file.parseInformation.dependenciesExterns)
        {
            dependencies = dependencies.concat(file.parseInformation.dependenciesExterns);
        }
    }
    this.ordonnedFiles = files;

    this.interns = interns.map(function(item)
    {
        item.module = this;
        return item;
    }, this);
    this.dependencies = dependencies;

    this.used = used;

    return true;
};

Module.prototype.generateDeclarationOutput = function()
{
    var contents = this.ordonnedFiles.map(function(file)
    {
       return file.declarationResult?file.declarationResult:"";
    });
    var content = contents.join("\n");
    this.getDeclarationFile().setDeclarationContent(content);
    return true;
};

Module.prototype.generateContentOutput = function()
{
    var contents = this.ordonnedFiles.map(function(file)
    {
       return file.jsResult?file.jsResult:"";
    });
    var content = contents.join("\n");
    this.getDeclarationFile().setContent(content);
    return true;
};
Module.prototype.getFullOutput = function(removeExtends)
{
    //add content from others modules
    var content = this.getOutput();
    if(removeExtends !== false)
    {
        //TODO:maybe needs a loop
        content = content.replace('var __extends = (this && this.__extends) || function (d, b) {\r\n'+
            '    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\r\n'+
        '    function __() { this.constructor = d; }\r\n'+
        '    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n'+
    '};', '');
        content = 'var __extends = (this && this.__extends) || function (d, b) {\r\n'+
            '    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\r\n'+
            '    function __() { this.constructor = d; }\r\n'+
            '    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n'+
            '};\r\n'+content;
    }
    return content;

};
Module.prototype.calculModulesDependencies = function()
{
    this.dependenciesModules = this.dependencies.map(function(item)
    {
        return item.module;
    });
    return true;
};
Module.prototype.addDependencies = function()
{
    this.useDependencies = true;
    return true;
};
Module.prototype.getOutput = function()
{
    return this.getDeclarationFile().content;
};
util.inherits(Module, EventEmitter);
/*
function DeclarationFile()
{
    EventEmitter.call(this);
    this.version = 0;
    this.content = null;
}
DeclarationFile.EVENT_UPDATED = "declarationfile_event_updated";
DeclarationFile.prototype.updateVersion = function()
{
    this.version ++;
    this.emit(DeclarationFile.EVENT_UPDATED);
};
DeclarationFile.prototype.setContent = function(content)
{
    if(this.content != content)
    {
        this.content = content;
        this.updateVersion();
    }
};
util.inherits(DeclarationFile, EventEmitter);*/
function File(folder, file)
{
    EventEmitter.call(this);
    this.path = path.join(folder, file);
    this.folder = folder;
    this.file = file;
    this.parseInformation = null;

    this.state = "not_ready";

    this.updated = false;
    this.updating = false;

    this.ready = false;
    this.content = null;

    this.importInvalidated = true;
    //this.parseInvalidated = true;

    this.imports = [];
    this.classes = [];

    this.version = 0;

    this.source = null;


    /**
     * Array of diagnostics
     */
    this.diagnostics;

    /**
     * First Syntax non valid
     */
    this._validSyntax = false;
    this._validParsed = false;
    this._validOutput = false;
}

File.EVENT_PARSED = "file_event_parsed";
File.EVENT_READY = "file_event_ready";
File.prototype.init = function()
{
    if(!this.updated)
    {
        this.readFromDisk((error, data)=>
        {
            if(error){
                die(error);
            }else
            {
                this.onReady();
            }
        });
    }
};
File.prototype.onReady = function()
{
    this.ready = true;
    this.state = "ready";
    this.emit(File.EVENT_READY, this.content);
};
File.prototype.inspect = function()
{
    return "[File path=\""+this.path+"\" length=\""+(this.content?this.content.length:0)+"\"]";
};
File.prototype.readFromDisk = function(callback)
{
    if(this.updating || this.updated)
    {
        return;
    }
    this.updating = true;
    if(!callback)
    {
        callback = function(error, data)
        {
          if(error)
          {
              die(error);
          }
        };
    }
    fs.readFile(this.path,  {encoding:'utf8', flag:'r'}, (error, data)=>
    {
            this.updating = false;
            if(error)
            {
                return callback(error, data);
            }
            this.content = data;
            this.snapshot = ts.ScriptSnapshot.fromString(this.content);
            this.updated = true;

            callback(error, data);
    });
};
File.prototype.readFromDiskSync = function()
{
    return fs.readFileSync(this.path,  {encoding:'utf8', flag:'r'});
};
File.prototype.getSnapShot = function()
{
    this.getContent();
    return this.snapshot;
};

File.prototype.getContent = function()
{
    //console.log(colors.magenta("Get content:"+this.path));
    if(this.updated && this.content)
    {
        return this.content;
    }else
    {
        var content = this.readFromDiskSync();
        if(content)
        {
            this.updated = true;
        }
        if(content != this.content)
        {
            this.importInvalidated = true;
            this.content = content;
            this.snapshot = ts.ScriptSnapshot.fromString(this.content);
        }
    }
    return this.content;
};
File.prototype.parse = function(source)
{
    if(!source)
    {
        source = this.source;
    }
    if(!this.updated || !this.content)
    {
        //reload content
        this.getContent();
    }
    //this.source = source;
    if(!this.isValidParsed())
    {
        var parsed = this.parseNode(0, source);

        var exposed = [];
        var intern = [];
        var extern = [];
        if(parsed.intern)
        {
            //exposed properties - for now even private are here
            exposed = exposed.concat(parsed.intern);
            intern = intern.concat(parsed.intern);
        }
        if(parsed.imports)
        {
            var data;
              for(var i=0; i<parsed.imports.length; i++)
              {
                    data = parsed.imports[i];
                    if(data.key)
                    {
                        intern.push({value:data.key, type:"import",namespace:data.namespace});
                    }
                    if(data.value)
                    {
                        extern.push({value:data.value, type:"import",namespace:data.namespace});
                    }
              }
        }
        if(parsed.used)
        {
            //exposed properties - for now even private are here
            for(var i=0; i<parsed.used.length; i++)
            {
                var data = parsed.used[i];
                var toAdd = true;
                var len;
                for(var p in intern)
                {
                    if(!intern[p].value)
                    {
                        continue;
                    }
                    len = intern[p].value.length;
                    var index = data.value.indexOf("/", len);
                    if(index!=len)
                    {
                        if(index == -1)
                        {
                            len = data.value.length;
                        }else
                        {
                            len = index;
                        }

                    }
                    if(intern[p].value == data.value.substring(0, len) || (intern[p].namespace && intern[p].namespace+"/"+intern[p].value == data.value.substring(0, len+intern[p].namespace.length+1)))
                    {
                        toAdd = false;
                        break;
                    }
                }

                if(toAdd)
                    for(var p in extern)
                    {
                        if(extern[p].value == data.value || (extern[p].namespace && extern[p].namespace+"/"+extern[p].value == data.value))
                        {
                            toAdd = false;
                            break;
                        }
                    }
                if(toAdd)
                {
                    extern.push(data);
                }
            }

            //imports
            //TODO:with vars
            var keylen;
            for(var i=0; i<parsed.used.length; i++)
            {
                for(var j=0; j<parsed.imports.length; j++)
                {
                    keylen = parsed.imports[j].key.length;
                    if(parsed.imports[j].key == parsed.used[i].value.substring(0, keylen) && (parsed.used[i].value.length == keylen || parsed.used[i].value.substr(keylen, 1)=="/"))
                    {
                        parsed.used[i].value = parsed.imports[j].value + parsed.used[i].value.substr(keylen);
                    }
                }
            }
        }


        //remove self dependencies
        var i = 0;
        tw: while(i<parsed.dependencies.length)
        {
            for(var p in parsed.intern)
            {

                if(Compiler.isInstanceOf(parsed.dependencies[i], parsed.intern[p]))
                {
                    parsed.dependencies.splice(i, 1);
                    continue tw;
                }
            }
            i++;
        }



        this.parseInformation = parsed;
        this.state = "parsed";

        this.validParse();
        this.emit(File.EVENT_PARSED, parsed);


        //TODO:add exposed link to this file + add import to others is they exists (+need recompile)
        //TODO:add dependencies to this file (module internal or external)
        //TODO:search for external dependencies matches then mark this as needs recompile
    }
};
File.prototype.parseNode = function(level, parsed, node)
{
    if(!node)
    {
        node = parsed;
        parsed = null;
    }
    if (!parsed)
    {
        parsed = {
            namespaces:[],
            imports:[],
            used:[],
            intern:[],
            dependencies:[]
        };
    }
    if(ts.SyntaxKind[node.kind] == "ModuleBlock")
    {
        var parent = node;
        while(parent.parent && ts.SyntaxKind[parent.parent.kind] === "ModuleDeclaration" )
        {
            parent = parent.parent;
        }
        if(parent)
        {
            var identifier = this.getIdentifier(node, parent);
            if(identifier)
            {
                identifier.type = "module";
                parsed.namespaces.push(identifier);
                parsed.currentNamespace = identifier.value;
            }
        }
    }else
    if(ts.SyntaxKind[node.kind] == "ImportEqualsDeclaration")
    {
        var identifier = this.getIdentifier(null, node);
        if(identifier)
        {
            identifier.namespace = parsed.currentNamespace;
            identifier.type = "import";
            parsed.imports.push(identifier);
        }
    }else
    if(ts.SyntaxKind[node.kind] == "ClassDeclaration" || ts.SyntaxKind[node.kind] == "InterfaceDeclaration")
    {
        var endNode = this.findFirstNode(node, ["FirstPunctuation", "HeritageClause"]);
        var identifiers = this.getIdentifiers(endNode, node);
      /*  console.log(identifiers);
        process.exit(1);
        debugger;*/
        if(identifiers.length)
        {
            for(var i=0; i<identifiers.length; i++)
            {
                identifiers[i].type = "class";
                identifiers[i].namespace = parsed.currentNamespace;
            }
            parsed.intern.push(identifiers[0]);
            parsed.used = parsed.used.concat(identifiers.slice(1));
        }
    }else
    if(ts.SyntaxKind[node.kind] == "FirstTypeNode")
    {
        var identifier = this.getIdentifier(null, node);
        if(identifier)
        {
            identifier.type="type";
            identifier.namespace= parsed.currentNamespace;
            //parsed.intern.push(identifiers[0]);
           parsed.used.push(identifier);
        }
    }else
    if(ts.SyntaxKind[node.kind] == "HeritageClause")
    {
        var endNode = this.findFirstNode(node, "FirstPunctuation");
        var identifiers = this.getIdentifiers(endNode, node);
        if(identifiers.length)
        {
            for(var p in identifiers)
            {
                identifiers[p].type = "heritage";
                identifiers[p].namespace = parsed.currentNamespace;

            }
            parsed.used = parsed.used.concat(identifiers);
            var parent = this._getNodeParent(node, 1);
            if(this.findFirstNode(node, "ExtendsKeyword") != null && ts.SyntaxKind[this._getNodeParent(node, 1).kind] == "ClassDeclaration")
                parsed.dependencies = parsed.dependencies.concat(identifiers);
        }
    }else
    if(ts.SyntaxKind[node.kind] == "PropertyAccessExpression")
    {
        var testNode = this.findFirstNode(node, "ThisKeyword");
        if(!testNode)
        {
            var parent = this._getNodeParent(node, 1);
            if((!parent || (ts.SyntaxKind[parent.kind] != "PropertyAccessExpression" && ts.SyntaxKind[parent.kind] != "ElementAccessExpression")))
            {
                var identifier = this.getIdentifier(null, node);
                if(identifier)
                {
                    identifier.type="propertyexpression";
                    identifier.namespace= parsed.currentNamespace;
                    //parsed.intern.push(identifiers[0]);
                    parsed.used.push(identifier);
                }
            }
        }
    }else
    if(ts.SyntaxKind[node.kind] == "ElementAccessExpression")
    {
        var testNode = this.findFirstNode(node, "ThisKeyword");
        if(!testNode)
        {
            var identifier = this.getIdentifier(null, node);
            if(identifier)
            {
                var parent = this._getNodeParent(node, 1);
                if((!parent || (ts.SyntaxKind[parent.kind] != "PropertyAccessExpression" && ts.SyntaxKind[parent.kind] != "ElementAccessExpression")))
                {
                    identifier.type="elementaccess";
                    identifier.namespace= parsed.currentNamespace;
                    //parsed.intern.push(identifiers[0]);
                    parsed.used.push(identifier);
                }
            }
        }
    }else
    if(ts.SyntaxKind[node.kind] == "PropertyDeclaration")
    {
        var parent = this._getNodeParent(node, 1);
        if(parent && ts.SyntaxKind[parent.kind] == "ClassDeclaration" )
        {
            //class properties
            var identifiers = this.getIdentifiers(null, node);
            for(var p in identifiers)
            {
                identifiers[p].type = "propertydeclaration1"
                identifiers[p].namespace = parsed.currentNamespace;
            }
            if(identifiers.length>1)
            {
                parsed.used.push(identifiers[1]);
            }
            var assignment = this.findFirstNode(node, "FirstAssignment");
            if(assignment)
            {
                var caster = this.findFirstNode(node, "FirstBinaryOperator");
                var nextNode = this._getNextNode(assignment);
                identifiers = this.getIdentifiers(null, nextNode);
                if(identifiers.length)
                {
                    if (caster) {
                        parsed.used.push(identifiers[0]);
                    }
                    var identifier = identifiers[identifiers.length-1];
                    identifier.type ="propertydeclaration2";
                    identifier.namespace =parsed.currentNamespace;
                    parsed.used.push(identifier);
                    //only if static
                    var isStatic = this.findFirstNode(node, "StaticKeyword");
                    if(isStatic!=null)
                    {
                        parsed.dependencies.push(identifier);
                    }
                }
            }
        }
    }
    var children = node.getChildren() || [];
    var str = "";
    for(var i=0;i<level; i++)
    {
        str+="\t";
    }
  //  console.log(str, colors.red(ts.SyntaxKind[node.kind]), children.length?'':node.getText());
    //console.log({kind:ts.SyntaxKind[node.kind],pos:node.pos, end:node.end, flags:node.flags, children:children.length});
    children.forEach(this.parseNode.bind(this, level+1, parsed));
    return parsed;
};
File.prototype._getNextNode = function(node)
{
    if(!node.parent)
    {
        return null;
    }
    var children = node.parent.getChildren();
    if(!children)
    {
        return null;
    }
    for(var i=0; i<children.length; i++)
    {
        if(children[i] === node)
        {
            return children[i+1];
        }
    }
    return null;
}
File.prototype._getNodeParent = function(node, index)
{
    if(index == undefined){
        index = 1;
    }
    while(index)
    {
        node = node.parent;
        index--;
    }
    return node;
};
File.prototype.getIdentifier = function(until, identifier, node)
{
    var identifiers = this.getIdentifiers(until, identifier, node);
    if(identifiers && identifiers.length)
    {
        return identifiers[0];
    }
    return null;
};
File.prototype.getIdentifiers = function(until, identifier, node)
{
    if(!node)
    {
        node = identifier;
        identifier = null;
    }
    if(!identifier)
    {
        identifier = [];
    }
    this._getIdentifier(until, identifier, node);

    var identifiers = [];
    var current  = {};
    var buffer = [];
    var insideBracket = false;
    var invalid = false;
    var bracket = "";
    for(var i=0; i<identifier.length; i++)
    {
        if (typeof identifier[i] == "object")
        {
            bracket += identifier[i].value;
        }else
        if (identifier[i] == "]")
        {
            insideBracket = false;
            if(!invalid && bracket)
            {
                buffer.push(bracket);
            }

        }else
        if (identifier[i] == "[")
        {
            insideBracket = true;
            bracket = "";

        }else
        if(identifier[i] == ",")
        {
            current.value = buffer.join("/");
            buffer.length = 0;
            if(!invalid)
            {
                identifiers.push(current);
            }
            current = {};
            invalid = false;
        }else
        if(identifier[i] == "=")
        {
            if(!invalid)
            {
                current.key = buffer.join("/");
                buffer.length = 0;
            }
        }else
        {
            if(insideBracket)
            {
                //not supported:identifier inside brackets
                invalid = true;
            }else
            {
                buffer.push(identifier[i]);
            }
        }
    }
    current.value = buffer.join("/");
    if(!invalid)
    {
        identifiers.push(current);
    }
    identifiers = identifiers.filter(function(item)
    {
        return item.value;
    });
    return identifiers;
};
File.prototype._getIdentifier = function(until, identifier, node)
{

    if(node === until)
    {
        return identifier;
    }
    if(!identifier)
    {
        identifier = [];
    }
    if(ts.SyntaxKind[node.kind] == "Identifier")
    {
        identifier.push(node.getText());
    }else
    if(ts.SyntaxKind[node.kind] == "FirstAssignment")
    {
        identifier.push(node.getText());
    }else
    if(ts.SyntaxKind[node.kind] == "ColonToken")
    {
        identifier.push(",");
    }else
    if(ts.SyntaxKind[node.kind] == "StringLiteral")
    {
        identifier.push({value:node.text,type:"string"});
    }else
    if(ts.SyntaxKind[node.kind] == "OpenBracketToken")
    {
        identifier.push("[");
    }else
    if(ts.SyntaxKind[node.kind] == "CloseBracketToken")
    {
        identifier.push("]");
    }else
    if(ts.SyntaxKind[node.kind] == "FirstBinaryOperator" || ts.SyntaxKind[node.kind] == "GreaterThanToken" || ts.SyntaxKind[node.kind] == "CommaToken" )
    {
        identifier.push(",");
    }
    var children = node.getChildren() || [];
    for(var i=0; i<children.length; i++)
    {
        child = this._getIdentifier(until, identifier, children[i]);
        if(child === identifier)
            return identifier;
    }
    //children.forEach(this.getIdentifier.bind(this, until, identifier));
    return null;
};
File.prototype.findFirstNode = function(node, type)
{
    if(typeof type == "string")
    {
        type = ts.SyntaxKind[type];
    }
    if(typeof type == "object")
    {
        for(var p in type)
        {
            if(typeof type[p] == "string")
            {
                type[p] = ts.SyntaxKind[type[p]];
            }
        }
    }
    if(node.kind == type || (typeof type == "object" && type.indexOf(node.kind)!=-1))
    {
        return node;
    }
    var children = node.getChildren() || [];
    var child;
    for(var i=0; i<children.length; i++)
    {
        child = this.findFirstNode(children[i], type);
        if(child)
            return child;
    }
    return null;
};

File.prototype.getImports = function()
{
    if(!this.updated || !this.content)
    {
        //reload content
        this.getContent();
    }
    if(this.importInvalidated)
    {
        this.imports.length = 0;

        var content = this.getContent();
        var reg = /(\/\/\/\s*<reference\s+path\s*=\s*)('|")(.+?)\2.*?\/>/gi;
        var result;
        result = content.match(reg);
        if(result)
            this.imports = result.map(function(file){ return {type:1, value:reg.exec(result)[3]};});



//        console.log(colors.cyan("OOOOOOOOOOOO"));


        var namespace = ".";
        var identifiers = [];
        //parse imports
        var scanner = ts.createScanner(2, true);
        scanner.setText(content);
        var token = scanner.scan();
  //      console.log(token, ts.SyntaxKind[token]);
        while (token !== 1 /* EndOfFileToken */)
        {
            //namespace list
            if(token === 124 /* NamespaceKeyword */ )
            {
                token = scanner.scan();
                var name = [];
                while((token === 67 || token === 21) && token !== 1 /* Identifier Dot && EndOfFileToken*/)
                {
                    if(token === 67 /* Identifier */)
                    {
                        name.push(scanner.getTokenValue());
                    }
                    token = scanner.scan();
                }
                namespace = name.join("/");
            }else
            if(token === 87 /* ImportKeyword */)
            {
                //import list
                token = scanner.scan();
                if(token === 67 /* Identifier */ )
                {
                    token = scanner.scan();
                    if(token === 55 /* FirstAssignment */ )
                    {
                        var name = [];
                        token = scanner.scan();
                        //TODO:test virgule aussi
                        while(token !== 23 && token !== 1 /* SemicolonToken && EndOfFileToken*/)
                        {
                            if(token === 67 /* Identifier */)
                            {
                                name.push(scanner.getTokenValue());
                            }
                            token = scanner.scan();
                        }
                        if(name.length)
                        {
                            this.imports.push({type:0, namespace:namespace, value:name.join("/")});
                        }
                    }
                }
            }else
            if(token === 80 /* ExportKeyword */)
            {
                //export list
            }else
            if(token === 67 /* Identifier */ )
            {
                name = [];
                while((token === 67 || token === 21) && token !== 1 /* Identifier Dot && EndOfFileToken*/)
                {
                    if(token === 67 /* Identifier */)
                    {
                        name.push(scanner.getTokenValue());
                    }
                    token = scanner.scan();
                }
                identifiers.push(name.join("/"));
            }

            //if nothing matched
            token = scanner.scan();
        }
        for(var p in scanner)
        {
            if(typeof scanner[p] == "function")
            {
                if(p.substring(0, 3) == "get")
                {
                    console.log(colors.red(p));
                }else
                {
                    console.log(colors.cyan(p));
                }
            }else
                console.log(p);
        }

        this.importInvalidated = false;
    }
};
File.prototype.setError = function(type, diagnostics)
{
    this.state = "error";
    this.diagnostics = diagnostics.map(function(item)
    {
        item.error_type = type;
        return item;
    });
};
File.prototype.hasError = function()
{
    return this.state.indexOf("error") == -1;
}
File.prototype.isValidParsed = function()
{
    return this._validParsed === true;
};
File.prototype.invalidParse = function()
{
    this._validParsed = false;
    this.invalidCompiled();
};
File.prototype.validParse = function()
{
    this._validParsed = true;
    this.diagnostics = null;
};
File.prototype.invalidOutput = function()
{
    this.state = "output_invalidated";
    this._validOutput = false;

};
File.prototype.isValidOutput = function()
{
   return this._validOutput === true;

};
File.prototype.validOutput = function()
{
    this.state = "output_validated";
    this._validOutput = true;
    this.diagnostics = null;
};

File.prototype.isValidCompiled = function()
{
    return this._validCompiled === true;
};

File.prototype.validCompiled = function()
{
    this.state = "compiled";
    this._validCompiled = true;
    this.diagnostics = null;
};
File.prototype.invalidCompiled = function()
{
    this.state = "compile_invalidated";
    this._validCompiled = false;
    this.invalidOutput();
};
File.prototype.isSemanticValidated = function()
{
    return this.state == "semantic_validated" || this.state == "compiled";
};
File.prototype.validSemantic = function()
{
    this.state = "semantic_validated";
};
File.prototype.validCompilation = function()
{
    this.state = "compiled";
};
File.prototype.isValidSyntax = function()
{
    return this._validSyntax === true;
};
File.prototype.validSyntax = function()
{
    this.state = "syntax_validated";
    this._validSyntax = true;
    this.diagnostics = null;
};
File.prototype.invalidSyntax = function()
{
    this.state = "syntax_invalidated";
    this._validSyntax = false;

    //TODO:invalid next steps
    this.invalidParse();
};
File.prototype.isInvalidate = function()
{
    //validate need to be called
    return this.state == "invalidated" || this.state == "ready";
};

File.prototype.validate = function()
{
    //force load content
    this.getContent();
    if (!this.updated) {
        die(this.file+" can't get content");
    }
};
File.prototype.invalidate = function()
{
    this.updated = false;
    this.version++;

    this.invalidSyntax();
    this.state = "invalidated";
};

util.inherits(File, EventEmitter);


function Compiler(module, config)
{
    this.tsConfig  = config;
    //this.tsConfig.compilerOptions["outFile"] = "test.js";
    //this.tsConfig.compilerOptions["noResolve"] = false;
    this.tsConfig.compilerOptions["declaration"] = true;
    this.module  = module;
    this.versions  = {};
    this.folder = path.join(module.folder, module.path);

    this.documentRegistry = null;
    this.serviceHost = null;
    this.services = null;

    this.files;
}

Compiler.prototype.init = function()
{

    this.files = this.tsConfig.files.reduce((previous, filename)=>
    {
        var file = this.module.getFile(filename);
        if(file)
        {
            previous[filename] = file;
        }else
            previous[filename] = {version:0};
        return previous;
    }, {});
    if(!this.serviceHost)
    {
        this.serviceHost =  {
            getScriptFileNames:()=>
            {
            /*    console.log( this.tsConfig.files);
                process.exit(1);*/
                if(this.module.useDependencies)
                {
                    var files = this.module.dependenciesModules.map(function(module)
                    {
                        console.log(module.getDeclarationFile());
                        return module.getDeclarationFile().file;
                    }).concat(this.module.ordonnedFiles.map(function(file)
                    {
                        return file.file;
                    }));
                    console.log(colors.red("files list"));
                    console.log(files);
                    return files;
                }else
                return this.tsConfig.files;},
            getScriptVersion: (fileName) => {
                return this.files[fileName] && this.files[fileName].version.toString()
            },
            getScriptSnapshot: (fileName,data, data2) => {
                var file;
                if((file = this.module.getFile(fileName)))
                {
                    return file.getSnapShot();
                }
                if(this.module.useDependencies && fileName.indexOf("lib.d.ts")==-1)
                {
                    console.log(this.module);
                    console.log(fileName);
                    console.log(this.module.getFile(fileName));
                    process.exit(1);
                }
                if (!fs.existsSync(fileName)) {
                    fileName = path.join(this.folder, fileName);
                    if (!fs.existsSync(fileName)) {
                        return undefined;
                    }
                }

                return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
            },
            getCurrentDirectory: () =>   this.folder,
            getCompilationSettings: () => this.tsConfig.compilerOptions,
            getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options)
        };
    }
    if(!this.documentRegistry)
    {
        this.documentRegistry = ts.createDocumentRegistry();
    }
    if(!this.services)
    {
        this.services = ts.createLanguageService(this.serviceHost, this.documentRegistry);
    }
    if(this.services.getCompilerOptionsDiagnostics().length)
    {
        console.log(colors.cyan("CompilerOptions Error"));
        console.log(this.services.getCompilerOptionsDiagnostics());
        return;
    }
    //TODO: update source when file updated ??
    var file;
    var sources = this.services.getProgram().getSourceFiles();
    for(var i=0; i<sources.length; i++)
    {
        file = this.module.getFile(sources[i].fileName);
        if(file)
        {
            file.source = sources[i];
        }
    }
};
Compiler.prototype.getImports = function(file)
{
    var imports = [];
    var scanner = ts.createScanner(2, false);
    scanner.setText(file.getContent());
    var token = scanner.scan();


    return imports;
}
Compiler.prototype.compile = function()
{
    var time = Date.now();
    var result = this._compile();
    if(result !== true)
    {
        var file = result[0];
        var type = result[1];
        var diagnostics = result[2];
        var position;
        console.log(colors.red(file.file+ " "+type+" error"));
        for(var i=0; i<diagnostics.length; i++)
        {
            position = ts.getLineAndCharacterOfPosition(file.source, diagnostics[i].start);
            console.log(file.file+"("+(position.line+1)+","+(position.character+1)+"): error T"+diagnostics[i].code+": "+ diagnostics[i].messageText);
        }
    }else
    {
        this._postCompile();
    }
    time = Date.now() - time;
    console.log(colors.cyan(time+" ms"));
};
/**
 * Check syntax and set file.diagnostics
 * @returns {*}
 */
Compiler.prototype.compileSyntax = function()
{
    var services = this.services;//ts.createLanguageService(this.serviceHost, this.documentRegistry);

    var file, diagnostics, errors = [];
    for(var p in this.files)
    {
        file = this.files[p];

        //force content load
        if (!file.isInvalidate())
        {
            file.validate();
        }
        //check syntax
        if(!file.isValidSyntax())
        {
            console.log(colors.cyan(file.file + " check syntax"));
            //pur syntax check
            diagnostics = services.getSyntacticDiagnostics(file.file);
            if(diagnostics.length)
            {
                file.setError("syntax", diagnostics);
                errors.push(file);
                file.invalidSyntax();
            }else
            {
                file.validSyntax();
            }
        }
    }
    //return errors or true
    return errors.length?errors:true;
};
Compiler.prototype.compileParse = function()
{
    var file;
    for(var p in this.files)
    {
        file = this.files[p];
        if(!file.isValidParsed())
        {
            console.log(colors.cyan(file.file + " parse"));
            //TODO:add imported files
            file.parse();
        }
        //console.log(services.getEmitOutput(sources[i].fileName));
    }
    return true;
};
Compiler.prototype.compileOutput = function()
{
    var program =  this.services.getProgram();
    var file, errors = [];
    for(var p in this.files)
    {
        file = this.files[p];
        if(!file.isValidOutput())
        {
            console.log(colors.cyan(file.file + " compile"));

            //get results
            file.declarationResult = null;
            file.jsResult = null;
            var result = program.emit(file.source, function(name, content)
            {
                //declaration
                if(name.indexOf(".d.ts") != -1)
                {
                    file.declarationResult = content;
                }else
                {
                    file.jsResult = content;
                }
            });
            if(file.jsResult && file.declarationResult)
            {
                file.validCompiled();
                var diagnostics = ts.getPreEmitDiagnostics(program, file.source);
                if(result.diagnostics)
                {
                    diagnostics = result.diagnostics.concat(diagnostics);
                }
                if(diagnostics.length)
                {
                    file.setError("compilation", diagnostics);
                    errors.push(file);
                    file.invalidOutput();
                }else
                {
                        file.validOutput();
                }
            }else
            {
                file.invalidCompiled();
                die("should not happen");
            }


        }
    }
    return errors.length?errors:true;
};

Compiler.prototype._postCompile = function()
{
    var file;
    var interns = [];
    var dependencies = [];
    var used = [];
    for(var p in this.files)
    {
        file = this.files[p];
     //   console.log(file.parseInformation);
        interns = interns.concat(file.parseInformation.intern);
        dependencies = dependencies.concat(file.parseInformation.dependencies);
        used = used.concat(file.parseInformation.used);
      //  console.log(p+":"+this.files[p].jsResult.length );
    }

    var files = [];
    for(var p in this.files)
    {
        files.push(this.files[p]);
    }
    //for test only
    //files.reverse();


    var lenIntern = interns.length;
    files.forEach(function(file)
    {
        var len = file.parseInformation.dependencies.length;
        file.parseInformation.dependenciesInterns = [];
        file.parseInformation.dependenciesExterns = [];
        var used, intern, isIntern;
        for(var i = 0; i<len; i++)
        {
            used = file.parseInformation.dependencies[i];
            isIntern = false;
            for(var j=0; j<lenIntern; j++)
            {
                intern = interns[j];
                if(used.namespace+'/'+used.value == intern.namespace+'/'+intern.value || used.value == intern.namespace+'/'+intern.value) {
                    isIntern = true;
                    break;
                }
            }
            if(isIntern)
            {
                file.parseInformation.dependenciesInterns.push(used);
            }else
            {
                file.parseInformation.dependenciesExterns.push(used);
            }
        }
       return file;
    });

    var len = files.length;
    var i = 0, j;
    var currentInterns = [];
    var dependency, isFound;
    var t = 0;
    var first;
    //define writing order
    while(i<len && t++<50)
    {
        file = files[i];
        console.log("test:", file);
        j =  file.parseInformation.dependenciesInterns.length;
        while(j>0)
        {
            dependency = file.parseInformation.dependenciesInterns[j-1];
            isFound = false;
            for(var k=0; k<currentInterns.length; k++)
            {
                if(dependency.namespace+'/'+dependency.value == currentInterns[k].namespace+'/'+currentInterns[k].value || dependency.value == currentInterns[k].namespace+'/'+currentInterns[k].value) {
                    isFound = true;
                    break;
                }
            }
            if(isFound)
            {
                file.parseInformation.dependenciesInterns.pop();
                j--;
            }else
            {
                console.log("not found:", dependency);
                //dendency not satisfated
                break;
            }
        }
        if(!file.parseInformation.dependenciesInterns.length)
        {
            i++;
            first = null;
            currentInterns = currentInterns.concat(file.parseInformation.intern);
            console.log("ok:", file);
        }else
        {
            console.log("not:", file);
            if(file === first)
            {
                console.log(files.slice(i));
                throw new Error("Cyclic dependency found");
            }
            files.splice(i, 1);
            files.push(file);
            if(!first)
            {
                first = file;
            }
        }
    }

    this.module.interns = interns;
    this.module.dependencies = dependencies;
    this.module.used = used;

    this.module.files_order = files;


    this.module.updateContent();

};
Compiler.prototype._compile = function()
{
    if(this.module.compiled)
    {
        return;
    }

    var services = this.services;//ts.createLanguageService(this.serviceHost, this.documentRegistry);

    this.compileSyntax();
    /*
    var file, diagnostics;
    var sources = services.getProgram().getSourceFiles();
    for(var i=0; i<sources.length; i++)
    {
        file = this.module.getFile(sources[i].fileName);
        if(file)
        {
            file.source = sources[i];
        }
    }
    for(var p in this.files)
    {
        file = this.files[p];

        if (!file.isInvalidate())
        {
            file.validate();
        }
        if(!file.isParsed())
        {
            console.log(colors.cyan(file.file + " check syntax"));
            //pur syntax check
            diagnostics = services.getSyntacticDiagnostics(file.file);
            if(diagnostics.length)
            {
                file.setError("syntax", diagnostics);
                return [file, "syntax", diagnostics];
            }
        }
    }
        */


    var program =  services.getProgram();


    this.compileParse();

    this.compileOutput();
    return true;


    /*    for(var p in this.files)
    {
        file = this.files[p];
        if(!file.isParsed())
        {
            console.log(colors.cyan(file.file + " parse"));
            //TODO:add imported files
            file.parse();
        }
        //console.log(services.getEmitOutput(sources[i].fileName));
    }*/



    for(var p in this.files)
    {
        file = this.files[p];

        if (!file.isInvalidate())
        {
            file.validate();
        }
        if(!file.isSemanticValidated())
        {
            /*console.log(colors.cyan(file.file + " check semantics"));
            //semantic
            diagnostics = services.getSemanticDiagnostics(file.file);
            if(diagnostics.length)
            {
                file.setError("semantics", diagnostics);
                console.log(colors.cyan("Semantics Error"));
                console.log(diagnostics);

                return;
            }else
            {
                file.validSemantic();
            }*/
            file.validSemantic();
        }
    }
    //TODO:if output write files in order






    //TODO:get extern d.ts value

    for(var p in this.files)
    {
        file = this.files[p];
        if(!file.isCompiled())
        {
            console.log(colors.cyan(file.file + " compile"));
            var diagnostics = ts.getPreEmitDiagnostics(program, file.source);
            if(!diagnostics.length)
            {
                var result = program.emit(file.source, function(name, content)
                {
                    //declaration
                    if(name.indexOf(".d.ts") != -1)
                    {
                        file.declarationResult = content;
                    }else
                    {
                        file.jsResult = content;
                    }
                });
                diagnostics = result.diagnostics;
            }
            if(diagnostics.length)
            {
                var result = program.emit(file.source, function(name, content)
                {
                    //declaration
                    if(name.indexOf(".d.ts") != -1)
                    {
                        file.declarationResult = content;
                    }else
                    {
                        file.jsResult = content;
                    }
                });
                console.log(file.jsResult);
                file.setError("compilation", diagnostics);
                return [file, "compilation", diagnostics];
            }else
            {
                file.validCompilation();
            }

        }
    }

    //console.log(;
    return true;
    console.log(program.emit(undefined, function(filename, data)
    {
        if(filename.indexOf(".d.ts")==-1)
        {
            console.log(colors.cyan(filename));
            console.log(data);
        }
    }));
/*
    console.log(result);
    console.log(program.getCompilerOptions());
*/




/*
    for(var p in source)
    {
        if(typeof source[p] == "function")
        {
            if(p.substring(0, 3) == "get")
            {
                console.log(colors.red(p));
            }else
            {
                console.log(colors.cyan(p));
            }
        }else
        console.log(p);
    }
    console.log(colors.cyan("----"));*/
   // console.log(source.getNamedDeclarations());
   // console.log(services.getTodoComments("HashMap3.ts"));
    //console.log(program.getClassifiableNames())
    //console.log(ts.preProcessFile(this.module.getFile("HashMap3.ts").getContent()));
    //console.log(program.getFileProcessingDiagnostics().getDiagnostics());

    return;
    //this.getImports()



    var program = services.getProgram();
    for(var p in program)
    {
        if(true)
        {
            console.log(p);
        }
    }
    /*
    var declarations = source.getNamedDeclarations();
    for(var p in declarations)
    {
        console.log(colors.cyan(p), declarations[p]);
        for(var q in declarations[p])
        {
            console.log(colors.red(q), declarations[p][q]);
        }
    }*/


 //   console.log(source.getNamedDeclarations());
    var output = services.getEmitOutput(source.fileName)
    //replace 2 by language version
    var scanner = ts.createScanner(2, false);
    scanner.setText(this.module.getFile(source.fileName).getContent());
    var token = scanner.scan();
    console.log(token);
    //console.log(colors.cyan(source.fileName), ts.preProcessFile(this.module.getFile(source.fileName).getContent(), true));
    //console.log(colors.cyan(source.fileName), source.getNamedDeclarations());
    return;




    //this.tsConfig.compilerOptions["outFile"] = "out.js";
    //this.tsConfig.compilerOptions["noEmit"] = true;
    this.tsConfig.compilerOptions["declaration"] = true;
    var files =  this.tsConfig.files.map(function(file){
        return path.join(this.module.folder,this.module.path, file)}, this);


    var program = ts.createProgram(files, this.tsConfig.compilerOptions);
    for(var p in program)
    {
        if(typeof program["p"] == "function")
        {
            console.log(p);
        }
        else
        {
            console.log(p);
        }
    }
    return;
    var emitResult = program.emit();

    var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach((diagnostic) => {
        var infos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${infos.line + 1},${infos.character + 1}): ${message}`);
});
    console.log("once");
    var error = emitResult.emitSkipped ? true: false;
    if(!error)
    {
        var emitResult = program.emit();

        var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

        allDiagnostics.forEach((diagnostic) => {
            var infos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file.fileName} (${infos.line + 1},${infos.character + 1}): ${message}`);
    });
        console.log("twice");
    }
};
Compiler.isInstanceOf = function(item, parent)
{
    var parentValue = parent.namespace+"/"+parent.value;

    var value =  item.namespace +"/"+ item.value;
    var len = parentValue.length;
    debugger;
    console.log(value.substring(0, len) );
    console.log(value.substr(len, 1));
    if(value.substring(0, len) == parentValue && (value.length == len || value.substr(len, 1)=="/"))
    {
        return true;
    }
    value = item.value;
    if(value.substring(0, len) == parentValue && (value.length == len || value.substr(len, 1)=="/"))
    {
        return true;
    }
    return false;
};


var compiler = new MetaCompiler();
compiler.config(configFilename, function(error, data)
{
    if(error) return die(error);


    compiler.init();
    compiler.compile();
});

