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

#import "CDVFile.h"
#import "CDVLocalFilesystem.h"
#import "CDVAssetLibraryFilesystem.h"

@implementation CDVFile (XFile)

- (void)pluginInitialize
{
    NSString *workspace = [[self ownerApp] getWorkspace];
    [self registerFilesystem:[[CDVLocalFilesystem alloc] initWithName:@"appworkspace" root:workspace]];
}

- (CDVFilesystemURL *)fileSystemURLforLocalPath:(NSString *)localPath
{
    CDVFilesystemURL *localURL = nil;
    NSUInteger index = 0;
    // Try all installed filesystems, in order. Return the most match url.
    // e.g. fs_type_1 fsRoot: /a/
    //      fs_type_2 fsRoot: /a/b/
    //      localPath: /a/b/file
    //      result: cdvfile://localhost/fs_type_2/file not cdvfile://localhost/fs_type_1/b/file
    for (id object in self.fileSystems) {
        if ([object respondsToSelector:@selector(URLforFilesystemPath:)]) {
            CDVFilesystemURL *url = [object URLforFilesystemPath:localPath];
            if (url){
                if (!localURL) {
                    localURL = url;
                    index = [[object fsRoot] length];
                }else{
                    if (index < [[object fsRoot] length]) {
                        localURL = url;
                        index = [[object fsRoot] length];
                    }
                }
            }
        }
    }
    return localURL;
}

- (NSString *) resolveFilePath:(NSString *)filePath
{
    //有效路径形式有以下几种：
    //1. 以'/'开头的绝对路径
    //2. file协议URL(处理方式同绝对路径)
    //3. cdvfile://localhost/<filesystemType>/<path to file>
    //4. 相对app workspace的相对路径
    NSString *validFilePath = nil;
    CDVFilesystemURL *fsURL = nil;
    NSString *resolvedSourceFilePath = nil;
    if ([XUtils isAbsolute:filePath])
    {
        filePath = [XUtils getAbsolutePath:filePath];
        fsURL = [self fileSystemURLforLocalPath:filePath];
    } else if ([filePath hasPrefix:kCDVFilesystemURLPrefix]){
        fsURL = [CDVFilesystemURL fileSystemURLWithString:filePath];
    } else if (NSNotFound !=[filePath rangeOfString:@":"].location) {
        return NO; //不支持形如C:/a/bc的路径
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

    return validFilePath;
}

@end
