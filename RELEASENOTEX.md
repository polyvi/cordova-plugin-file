<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
# Release Note X


### 0.2.3 Wed Jan 08 2014 15:14:47 GMT+0800 (CST)
 *  added releasenotex.md

## 0.2.4 (Fri Feb 28 2014)


 *  [iOS] Add comments to resolveFilePath:
 *  [iOS] Since we can support multiple fs, the src and dest maybe reside in different fs, we should use the corresponding fs to get fsPath.
 *  Added auto tests for APPWORKSPACE fs
 *  [android]Modify cordova codes to fix get appworkspace filesystem error by using resolveLocalFileSystemURL interface
 *  [iOS] Implement resolve file path in CDVFile+XFile
 *  [iOS]Override fileSystemURLforLocation to return the most match url
 *  [android]Register appworkspace as a new filesystem type.
 *  [iOS] Register appworkspace as a new filesystem type.
 *  Sync cordova file auto tests
 *  CB-5980 Updated version and RELEASENOTES.md for release 1.0.0
 *  CB-5974: Use safe 'Compatibilty' mode by default
 *  CB-5915: CB-5916: Reorganize preference code to make defaults possible
 *  CB-5974: Android: Don't allow File operations to continue when not configured
 *  CB-5960: ios: android: Properly handle parent references in getFile/getDirectory
 *  [ubuntu] adopt to recent changes
 *  Add default FS root to new FS objects
 *  CB-5899: Make DirectoryReader.readEntries return properly formatted Entry objects
 *  Add constuctor params to FileUploadResult related to CB-2421
 *  Fill out filesystem attribute of entities returned from resolveLocalFileSystemURL
 *  CB-5916: Create documents directories if they don't exist
 *  CB-5915: Create documents directories if they don't exist
 *  CB-5916: Android: Fix unfortunate NPE in config check
 *  CB-5916: Android: Add "/files/" to persistent files path
 *  CB-5915: ios: Update config preference (and docs) to match issue
 *  CB-5916: Android: Add config preference for Android persistent storage location
 *  iOS: Add config preference for iOS persistent storage location
 *  iOS: Android: Allow third-party plugin registration
 *  Android: Expose filePlugin getter so that other plugins can register filesystems
 *  Fix typos in deprecation message
 *  Add backwards-compatibility shim for file-transfer
 *  Android: Allow third-party plugin registration
 *  CB-5810 [BlackBerry10] resolve local:/// paths (application assets)
 *  CB-5774: create DirectoryEntry instead of FileEntry
 *  Initial fix for CB-5747
 *  Change default FS URL scheme to "cdvfile"
 *  Android: Properly format content urls
 *  Android, iOS: Replace "filesystem" protocol string with constant
 *  Android: Allow absolute paths on Entry.getFile / Entry.getDirectory
 *  Android: Make clear that getFile takes a path, not just a filename
 *  CB-5008: Rename resolveLocalFileSystemURI to resolveLocalFileSystemURL; deprecate original
 *  Remove old file reference from plugin.xml
 *  Android: Refactor File API
 *  CB-4899 [BlackBerry10] Fix resolve directories
 *  CB-5602 Windows8. Fix File Api mobile spec tests
 *  Android: Better support for content urls and cross-filesystem copy/move ops
 *  CB-5699 [BlackBerry10] Update resolveLocalFileSystemURI implementation
 *  CB-5658 Update license comment formatting of doc/index.md
 *  CB-5658 Add doc.index.md for File plugin.
 *  CB-5658 Delete stale snapshot of plugin docs
 *  CB-5403: Backwards-compatibility with file:// urls where possible
 *  CB-5407: Fixes for ContentFilesystem
 *  Android: Add method for testing backwards-compatibility of filetransfer plugin
 *  iOS: Add method for testing backwards-compatiblity of filetransfer plugin
 *  Android: Updates to allow FileTransfer to continue to work
 *  Android: Clean up unclosed file objects
 *  CB-5407: Cleanup
 *  CB-5407: Add new Android source files to plugin.xml
 *  CB-5407: Move read, write and truncate methods into modules
 *  CB-5407: Move copy/move methods into FS modules
 *  CB-5407: Move getParent into FS modules
 *  CB-5407: Move getmetadata methods into FS modules
 *  CB-5407: Move readdir methods into FS modules
 *  CB-5407: Move remove methods into FS modules
 *  CB-5407: Move getFile into FS modules
 *  CB-5407: Start refactoring android code: Modular filesystems, rfs, rlfsurl
 *  CB-5407: Update android JS to use FS urls
 *  CB-5405: Use URL formatting for Entry.toURL
 *  CB-5532 Fix
 *  Log file path for File exceptions.
 *  Partial fix for iOS File compatibility with previous fileTransfer plugin
 *  CB-5532 WP8. Add binary data support to FileWriter
 *  CB-5531 WP8. File Api readAsText incorrectly handles position args
 *  [ubuntu] use cordova/exec/proxy
 *  [ubuntu] change location of persistent dir
 *  add ubuntu platform
 *  1. Added amazon-fireos platform 2. Change to use amazon-fireos as a platform is the user agent string contains 'cordova-amazon-fireos'
 *  CB-5118 [BlackBerry10] Add check for undefined error handler
 *  CB-5406: Extend public API for dependent plugins
 *  CB-5403: Bump File plugin major version
 *  CB-5406: Split iOS file plugin into modules
 *  CB-5406: Factor out filesystem providers in iOS
 *  CB-5408: Add handler for filesystem:// urls
 *  CB-5406: Update iOS native code to use filesystem URLs internally
 *  CB-5405: Update JS code to use URLs exclusively
 *  CB-4816 Fix file creation outside sandbox for BB10
 *  CB-5188:
 *  [CB-5188] Updated version and RELEASENOTES.md for release 0.2.5
 *  CB-5129: Add a consistent filesystem attribute to FileEntry and DirectoryEntry objects
 *  CB-5128: added repo + issue tag to plugin.xml for file plugin
 *  CB-5015 [BlackBerry10] Add missing dependency for File.slice
 *  [CB-5010] Incremented plugin version on dev branch.
 *  [CB-5010] Updated version and RELEASENOTES.md for release 0.2.4
 *  CB-5020 - File plugin should execute on a separate thread
 *  [CB-4915] Incremented plugin version on dev branch.
 *  CB-4504: Updating FileUtils.java to compensate for Java porting failures in the Android SDK. This fails because Java knows nothing about android_asset not being an actual filesystem
 *  Revert "Updated requestFileSystem, set app workspace path as fs.root.fullPath"
 *  Revert "Added FileExec for file plugin, and changed cordova/exec to FileExec in DirectoryEntry and Entry"
 *  Revert "Added support for DirectoryReader,FileEntry,FileReader,FileWriter in FileExec"
 *  Revert "Updated resolveLocalFileSystemURI, if entry.fullPath in not under app workspace, then return SECURITY_ERR"
 *  Revert "Added spec tests for file exec"
 *  Revert "Optimized the implementation of getParent, and changed the directory entry's name from "Documents" to "workspace""
 *  Revert "Rename file-workspace.tests.js to file.xface.tests.js"
 *  Revert "Added xface auto tests for file plugin"
 *  batch modify .reviewboard
 *  batch modify .reviewboard


## 1.0.2 (Thu Mar 20 2014)


 *  [iOS] Add support for bundle resource
 *  [Android]Fix file plugin can't find APPWORKSPACE file system according to file path
 *  Update plugin version to 1.0.2-dev
 *  Register app workspace fs when pageDidLoad to avoid registering a nil root.
 *  Update plugin version to 1.0.1
 *  Sync Cordova tests
 *  Since Cordova fileSystemURLforLocalPath: is able to return the most match url, use Cordova code directly.
 *  Update RELEASENOTES.md yet again :P
 *  Add NOTICE file
 *  CB-6114 Updated version and RELEASENOTES.md for release 1.0.1
 *  CB-5980 Updated version and RELEASENOTES.md for release 1.0.0
 *  CB-6116: Fix error where resolveLocalFileSystemURL would fail to parse file://localhost/<path> URLs
 *  CB-6116: Fix error where resolveLocalFileSystemURL would sometimes fail to return
 *  CB-6106: Add support for nativeURL attribute on Entry objects
 *  Add NOTICE file
 *  CB-6114 Updated version and RELEASENOTES.md for release 1.0.1
 *  CB-5980 Updated version and RELEASENOTES.md for release 1.0.0
 *  CB-6110: iOS: Fix typo in filesystemPathForURL: method
 *  Port lmnbeyond's File fixes to Android as well
 *  ios:Update fileSystemURLforLocalPath: to return the most match url.
 *  Allow third-party plugin registration, and the total count of fs type is not limited to just 4.
 *  CB-6097-Added missing files for amazon-fireos platform. Added onLoad flag to true.
 *  CB-6087: Android, iOS: Load file plugin on startup
 *  CB-6013 [BlackBerry10] wrap webkit prefixed called in requestAnimationFrame
 *  Update plugin writers' documentation
 *  CB-6080: Fix file copy when src and dst are on different local file systems
 *  Update RELEASENOTES.md
 *  CB-6057: Add notes for plugin authors about dealing with cdvfile:// URLs
 *  CB-6057: Add methods to convert from URLs to filesystem paths
 *  Android: Remove terribly out-of-date comment about only SD card being accessible
 *  CB-6050: Create instance method for returning a FileEntry structure given a device file path
 *  CB-2432 CB-3185 CB-5975: Correctly handle content:// urls especially when non-local-to-device
 *  Docs: Fix typos. (Closes issue 26)
 *  ios: Remove unused local (Closes: issue 28)
 *  CB-6022: Add upgrade notes to doc
 *  CB-5233: ios: Fixes for asset-library URLs
 *  CB-6012: Preserve query parameters in cdvfile:// urls; strip query params from local filesystem urls when searching for files
 *  CB-6010: ios: Test filesystem plugins for presence of optional URLforFilesystemPath before calling
 *  Add release notes for 1.0.1
 *  CB-5980 Incremented plugin version on dev branch.
 *  CB-5980 Updated version and RELEASENOTES.md for release 1.0.0
 *  CB-5959: Android: Ensure that directories return size 0
 *  CB-5959: Android, iOS: Return size with Entry.getMetadata() method
 *  [Android]Fix copy failed when cross file system
 *  Incremented plugin version on dev branch to 0.2.5-dev
