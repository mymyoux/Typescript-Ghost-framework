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
        this.modules[relative].once("ready", this.onModuleReady.bind(this, this.modules[relative]));
    }
    if(this.modules[relative].folder != folder)
    {
       return die(colors.cyan(this.modules[relative].folder)+ " and "+ colors.cyan(folder)+ " have both module "+ colors.red(relative)+ " it is not currently supported");
    }
    return this.modules[relative];
};
MetaCompiler.prototype._checkIsReady = function()
{

    console.log(this.modules);

    this.modules["level/data"].compile();

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
    console.log("done");
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
}
Module.prototype.inspect = function()
{
    return "[Module name=\""+this.path+"\" files=\""+this.tsConfig.files.length+"\"]";
}
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
        this.files[this.tsConfig.files[p]].on("ready", this.onFileReady.bind(this, this.files[this.tsConfig.files[p]]));
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
Module.prototype.onReady = function()
{
    this.ready = true;

    this.emit("ready");
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
    file = path.relative(this.path, path.relative(this.folder, file));
    return this.files[file];
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
}

util.inherits(Module, EventEmitter);



function File(folder, file)
{
    EventEmitter.call(this);
    this.path = path.join(folder, file);
    this.folder = folder;
    this.file = file;

    this.updated = false;
    this.updating = false;

    this.ready = false;
    this.content = null;

    this.importInvalidated = true;
    this.parseInvalidated = true;

    this.imports = [];
    this.classes = [];
}

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
    this.emit("ready", this.content);
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
            this.updated = true;

            callback(error, data);
    });
};
File.prototype.readFromDiskSync = function()
{
    return fs.readFileSync(this.path,  {encoding:'utf8', flag:'r'});
};
File.prototype.getContent = function()
{
    console.log(colors.magenta("Get content:"+this.path));
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
        }
    }
    return this.content;
};
File.prototype.parse = function(source)
{
    if(!this.updated || !this.content)
    {
        //reload content
        this.getContent();
    }
    if(this.parseInvalidated)
    {


        this.parseInvalidated = true;
       var parsed = this.parseNode(0, source);
        console.log(parsed);

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
        }
        console.log(parsed);
        console.log(colors.cyan("------- exposed "));
        console.log(exposed);
        console.log(colors.cyan("* intern"));
        console.log(intern);
        console.log(colors.cyan("* extern"));
        console.log(extern);
        console.log(extern.map(function(item){return item.value}));
        //TODO:add exposed link to this file + add import to others is they exists (+need recompile)
        //TODO:add dependencies to this file (module internal or external)
        //TODO:search for external dependencies matches then mark this as needs recompile

        return;
     //   console.log(source.getNamedDeclarations());
        var children = source.getChildren();
        children.forEach(function(node)
        {
                console.log({kind:ts.SyntaxKind[node.kind],pos:node.pos, end:node.end, flags:node.flags, children:node.getChildren()});
        });
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
            intern:[]
        };
    }
    if(ts.SyntaxKind[node.kind] == "ModuleBlock")
    {
        var parent = node;
        console.log("preok");
        while(parent.parent && ts.SyntaxKind[parent.parent.kind] === "ModuleDeclaration" )
        {
            parent = parent.parent;
        }
        if(parent)
        {
            var identifier = this.getIdentifier(node, parent);
            if(identifier)
            {
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
        }
    }else
    if(ts.SyntaxKind[node.kind] == "PropertyAccessExpression")
    {
        var testNode = this.findFirstNode(node, "ThisKeyword");
        if(!testNode)
        {

            var identifier = this.getIdentifier(null, node);
            if(identifier)
            {
                identifier.type="property";
                identifier.namespace= parsed.currentNamespace;
                //parsed.intern.push(identifiers[0]);
                parsed.used.push(identifier);
            }
            //TODO:check there is no missed data
            return;
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
                identifier.type="property";
                identifier.namespace= parsed.currentNamespace;
                //parsed.intern.push(identifiers[0]);
                parsed.used.push(identifier);
            }
        }
    }else
    if(ts.SyntaxKind[node.kind] == "PropertyDeclaration")
    {
        var parent = this._getNodeParent(node, 1);
        console.log(ts.SyntaxKind[parent.kind])
        debugger;
        if(parent && ts.SyntaxKind[parent.kind] == "ClassDeclaration" )
        {
            //class properties
            var identifier = this.getIdentifier(null, node);
            console.log(identifier);
            debugger;
        }
    }

    var children = node.getChildren() || [];
    var str = "";
    for(var i=0;i<level; i++)
    {
        str+="\t";
    }
    console.log(str, colors.red(ts.SyntaxKind[node.kind]), children.length?'':node.getText());
    //console.log({kind:ts.SyntaxKind[node.kind],pos:node.pos, end:node.end, flags:node.flags, children:children.length});
    children.forEach(this.parseNode.bind(this, level+1, parsed));
    return parsed;
};
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



        console.log(colors.cyan("OOOOOOOOOOOO"));


        var namespace = ".";
        var identifiers = [];
        //parse imports
        var scanner = ts.createScanner(2, true);
        scanner.setText(content);
        var token = scanner.scan();
        console.log(token, ts.SyntaxKind[token]);
        while (token !== 1 /* EndOfFileToken */)
        {
            //namespace list
            if(token === 124 /* NamespaceKeyword */ )
            {
                console.log(colors.red( ts.SyntaxKind[token]));
                token = scanner.scan();
                console.log(token, ts.SyntaxKind[token]);
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
                console.log(colors.cyan(namespace));
            }else
            if(token === 87 /* ImportKeyword */)
            {
                //import list
                token = scanner.scan();
                console.log(token, ts.SyntaxKind[token]);
                if(token === 67 /* Identifier */ )
                {
                    token = scanner.scan();
                    console.log(token, ts.SyntaxKind[token]);
                    if(token === 55 /* FirstAssignment */ )
                    {
                        var name = [];
                        token = scanner.scan();
                        console.log(token, ts.SyntaxKind[token]);
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
            console.log(token, ts.SyntaxKind[token]);
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
        console.log(token, ts.SyntaxKind[token]);

        console.log(this.imports);
        console.log(colors.red("ok"));
        console.log(identifiers);

        this.importInvalidated = false;
    }
}
File.prototype.invalidate = function()
{
    this.updated = false;;
};

util.inherits(File, EventEmitter);


function Compiler(module, config)
{
    this.tsConfig  = config;
    this.tsConfig.compilerOptions["outFile"] = "test.js";
    this.tsConfig.compilerOptions["noResolve"] = true;
    this.module  = module;
    this.versions  = {};
    this.folder = path.join(module.folder, module.path);

    this.files;
}

Compiler.prototype.init = function()
{

    this.files = this.tsConfig.files.reduce(function(previous, filename)
    {
        previous[filename] = {version:0};
        return previous;
    }, {});
    /*const servicesHost =  {
        getScriptFileNames: () => rootFileNames,
    getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: (fileName) => {
    if (!fs.existsSync(fileName)) {
        return undefined;
    }

    return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
},
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
};*/
    /*
    for(var p in ts)
    {
        if(typeof ts[p] == "function")
        {
            if(p.indexOf("create")>-1)
            console.log(p);
        }
    }*/
    this.compile();

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
    if(this.module.compiled)
    {
        return;
    }
    var servicesHost =
    {
        getScriptFileNames:()=>this.tsConfig.files,
        getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
        getScriptSnapshot: (fileName) => {
            if(this.module.hasFile(fileName))
            {
                return ts.ScriptSnapshot.fromString(this.module.getFile(fileName).getContent());
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
    var document = ts.createDocumentRegistry();
    var services = ts.createLanguageService(servicesHost, document);
    var program = services.getProgram();
    var file = path.relative("/",path.join(this.folder, "HashMap.ts"));
    var source = services.getProgram().getSourceFiles()[2];

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
    console.log(colors.cyan("----"));
   // console.log(source.getNamedDeclarations());
   // console.log(services.getTodoComments("HashMap3.ts"));
    //console.log(program.getClassifiableNames())
    //console.log(ts.preProcessFile(this.module.getFile("HashMap3.ts").getContent()));
    //console.log(program.getFileProcessingDiagnostics().getDiagnostics());
    this.module.getFile("HashMap3.ts").parse(source);
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
    this.tsConfig.compilerOptions["noEmit"] = true;
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
    console.log(program.getTypeChecker());
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


var compiler = new MetaCompiler();
compiler.config(configFilename, function(error, data)
{
    if(error) return die(error);


    compiler.init();
    compiler.compile();
});

