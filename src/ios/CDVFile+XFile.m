/*
 This file was modified from or inspired by Apache Cordova.

 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements. See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership. The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  CDVFile+XFile.m
//

#import <xFace/XUtils.h>
#import <XFace/XApplication.h>
#import <XFace/CDVPlugin+XPlugin.h>

#import "CDVFile+XFile.h"
#import "CDVLocalFilesystem.h"
#import "CDVAssetLibraryFilesystem.h"

@implementation CDVFile (XFile)

- (void)pageDidLoad
{
    //File plugin gets initialized on startup,but at the very moment,
    //the connection between vc and default app has not yet been established,
    //so we have to register appworkspace fs when pageDidLoad.
    NSString *workspace = [self.ownerApp getWorkspace];
    [self registerFilesystem:[[CDVLocalFilesystem alloc] initWithName:@"appworkspace" root:workspace]];
}

- (NSString *) resolveFilePath:(NSString *)aFilePath
{
    //有效路径形式有以下几种：
    //1. 以'/'开头的绝对路径
    //2. file协议URL(处理方式同绝对路径)
    //3. cdvfile://localhost/<filesystemType>/<path to file>
    //4. 相对app workspace的相对路径
    NSString *validFilePath = nil;
    CDVFilesystemURL *fsURL = nil;
    NSString *resolvedSourceFilePath = nil;
    NSString *filePath = aFilePath;
    if ([XUtils isAbsolute:filePath])
    {
        filePath = [XUtils getAbsolutePath:filePath];
        fsURL = [self fileSystemURLforLocalPath:filePath];
    } else if ([filePath hasPrefix:kCDVFilesystemURLPrefix]){
        fsURL = [CDVFilesystemURL fileSystemURLWithString:filePath];
    } else if (NSNotFound !=[filePath rangeOfString:@":"].location) {
        return nil; //不支持形如C:/a/bc的路径
    } else{
        resolvedSourceFilePath = [XUtils resolvePath:filePath usingWorkspace:[[self ownerApp] getWorkspace]];
    }

    if (fsURL) {
        //TODO: 处理filesystemType为assets-library的情况
        NSObject<CDVFileSystem> *fs = [self filesystemForURL:fsURL];
        validFilePath = [fs filesystemPathForURL:fsURL];
    } else {
        validFilePath = resolvedSourceFilePath;
    }

    if (!validFilePath.length && [XUtils isAbsolute:aFilePath]) {
        //处理绝对路径指向bundle资源的情况
        NSString* bundlePath = [[NSBundle mainBundle] bundlePath];
        filePath = [aFilePath hasPrefix:@"/"] ? [aFilePath copy] : [[NSURL URLWithString:aFilePath] path];
        if (filePath && [filePath hasPrefix:bundlePath]) {
            return filePath;
        }
    }

    return validFilePath;
}

@end
