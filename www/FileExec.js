/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var privateModule = require('xFace/privateModule'),
    workspace = require('xFace/workspace'),
    exec = require('cordova/exec'),
    FileError = require('./FileError');

function FileExec() {
    if(!workspace.enableWorkspaceCheck){
        exec.apply(this, arguments);
        return;
    }

    var successCallback = arguments[0];
    var failCallback = arguments[1];
    var service = arguments[2];
    var action = arguments[3];
    var actionArgs = arguments[4];

    if("File" !== service){
        throw new Error('Plugin ' + service + ' should not use fileExec.');
    }

    var fullPath = actionArgs[0];
    var functionName = service + '.' + action;
    if( ("getMetadata" === action) ||
        ("setMetadata" === action) ||
        ("moveTo" === action) ||
        ("copyTo" === action) ||
        ("remove" === action) ||
        ("removeRecursively" === action) ||
        ("getParent" === action) ||
        ("readEntries" === action) ||
        ("getFileMetadata" === action) ||
        ("readAsText" === action) ||
        ("readAsDataURL" === action) ||
        ("readAsBinaryString" === action) ||
        ("readAsArrayBuffer" === action) ||
        ("write" === action) ||
        ("truncate" === action) ){
        var result = workspace.checkWorkspace(privateModule.appWorkspace(), fullPath, functionName);
        if (!result){
            var fileError = ("setMetadata" !== action) ? FileError.INVALID_MODIFICATION_ERR : undefined;
            failCallback(fileError);
            return;
        }
    }else if( ("getDirectory" === action) || ("getFile" === action) ){
        var path = actionArgs[1];
        var result = workspace.checkWorkspace(privateModule.appWorkspace(), fullPath, functionName);
        if (!result){
            failCallback(FileError.INVALID_MODIFICATION_ERR);
            return;
        }else if(!workspace.checkWorkspace(result, path, functionName)){
            failCallback(FileError.INVALID_MODIFICATION_ERR);
            return;
        }
    }

    if( ("moveTo" === action) || ("copyTo" === action)){
        var parentPath = actionArgs[1];
        var newName = actionArgs[2];
        var newFullPath = workspace.buildPath(parentPath, newName);

        var result = workspace.checkWorkspace(privateModule.appWorkspace(), newFullPath, functionName);
        if (!result){
            failCallback(FileError.INVALID_MODIFICATION_ERR);
            return;
        }
    }else if( ("remove" === action) || ("removeRecursively" === action) ){
        if(fullPath == privateModule.appWorkspace()){
            // TODO:增加工具方法处理fullPath以“/”结尾的情况
            failCallback(FileError.NO_MODIFICATION_ALLOWED_ERR);
            return;
        }
    }else if("getParent" === action){
        if(fullPath == privateModule.appWorkspace()){
            successCallback({'isfile':0,'isDirectory':1,'name':'Documents','fullPath':fullPath});
            return;
        }
    }

    exec.apply(this, arguments);
}

module.exports = FileExec;
