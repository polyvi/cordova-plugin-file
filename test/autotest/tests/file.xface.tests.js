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

describe('File API', function() {
    // Adding a Jasmine helper matcher, to report errors when comparing to FileError better.
    var fileErrorMap = {
        1: 'NOT_FOUND_ERR',
        2: 'SECURITY_ERR',
        3: 'ABORT_ERR',
        4: 'NOT_READABLE_ERR',
        5: 'ENCODING_ERR',
        6: 'NO_MODIFICATION_ALLOWED_ERR',
        7: 'INVALID_STATE_ERR',
        8: 'SYNTAX_ERR',
        9: 'INVALID_MODIFICATION_ERR',
        10:'QUOTA_EXCEEDED_ERR',
        11:'TYPE_MISMATCH_ERR',
        12:'PATH_EXISTS_ERR'
    };
    beforeEach(function() {
        this.addMatchers({
            toBeFileError: function(code) {
                var error = this.actual;
                this.message = function(){
                    return "Expected FileError with code " + fileErrorMap[error.code] + " (" + error.code + ") to be " + fileErrorMap[code] + "(" + code + ")";
                };
                return (error.code == code);
            },
            toCanonicallyMatch:function(path){
                this.message = function(){
                    return "Expected paths to match : " + path + " should be " + this.actual;
                };

                var a = path.split("/").join("").split("\\").join("");
                var b = this.actual.split("/").join("").split("\\").join("");

                return a == b;
            }
        });
    });

    // HELPER FUNCTIONS

    // deletes specified file or directory
    var deleteEntry = function(name, success, error) {
        // deletes entry, if it exists
        window.resolveLocalFileSystemURI(root.toURL() + '/' + name,
            function(entry) {
                if (entry.isDirectory === true) {
                    entry.removeRecursively(success, error);
                } else {
                    entry.remove(success, error);
                }
            }, success);
    };
    // deletes file, if it exists, then invokes callback
    var deleteFile = function(fileName, callback) {
        root.getFile(fileName, null,
                // remove file system entry
                function(entry) {
                    entry.remove(callback, function() { console.log('[ERROR] deleteFile cleanup method invoked fail callback.'); });
                },
                // doesn't exist
                callback);
    };
    // deletes and re-creates the specified file
    var createFile = function(fileName, success, error) {
        deleteEntry(fileName, function() {
            root.getFile(fileName, {create: true}, success, error);
        }, error);
    };
    // deletes and re-creates the specified directory
    var createDirectory = function(dirName, success, error) {
        deleteEntry(dirName, function() {
           root.getDirectory(dirName, {create: true}, success, error);
        }, error);
    };

    var createFail = function(module) {
        return jasmine.createSpy().andCallFake(function(err) {
            console.log('[ERROR ' + module + '] ' + JSON.stringify(err));
        });
    };

    var createWin = function(module) {
        return jasmine.createSpy().andCallFake(function() {
            console.log('[ERROR ' + module + '] Unexpected success callback');
        });
    };

    describe('File workspace', function() {
        describe('LocalFileSystem', function() {
            describe('window.requestFileSystem', function() {
                it("file.xface.spec.1 PERSISTENT file system should contain workspace key word", function() {
                    var win = jasmine.createSpy().andCallFake(function(fileSystem) {
                        expect(fileSystem).toBeDefined();
                        expect(fileSystem.root).toBeDefined();
                        expect(-1 != fileSystem.root.fullPath.indexOf('apps')).toBe(true);
                        expect(-1 != fileSystem.root.fullPath.indexOf('workspace')).toBe(true);
                    }),
                    fail = createFail('window.requestFileSystem');

                    // retrieve PERSISTENT file system
                    runs(function() {
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, win, fail);
                    });

                    waitsFor(function() { return win.wasCalled; }, "success callback never called", Tests.TEST_TIMEOUT);

                    runs(function() {
                        expect(fail).not.toHaveBeenCalled();
                        expect(win).toHaveBeenCalled();
                    });
                });
                it("file.xface.spec.2 TEMPORARY file system should contain workspace key word", function() {
                    var win = jasmine.createSpy().andCallFake(function(fileSystem) {
                        expect(fileSystem).toBeDefined();
                        expect(fileSystem.root).toBeDefined();
                        expect(-1 != fileSystem.root.fullPath.indexOf('apps')).toBe(true);
                        expect(-1 != fileSystem.root.fullPath.indexOf('workspace')).toBe(true);
                    }),
                    fail = createFail('window.requestFileSystem');

                    // Request the file system
                    runs(function() {
                        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, win, fail);
                    });

                    waitsFor(function() { return win.wasCalled; }, "success callback never called", Tests.TEST_TIMEOUT);

                    runs(function() {
                        expect(fail).not.toHaveBeenCalled();
                        expect(win).toHaveBeenCalled();
                    });
                });
            });

            describe('window.resolveLocalFileSystemURI', function() {
                it("file.xface.spec.3 should resolve app workspace correctly", function() {
                    var win = jasmine.createSpy().andCallFake(function(fileEntry) {
                        expect(fileEntry).toBeDefined();
                        expect(fileEntry.name).toBe("workspace");
                    }),
                    fail = createDoNotCallSpy('window.resolveLocalFileSystemURI');
                    resolveCallback = jasmine.createSpy().andCallFake(function(fileSystem) {
                        // lookup file system entry
                        runs(function() {
                            window.resolveLocalFileSystemURI(fileSystem.root.toURL(), win, fail);
                        });

                        waitsForAny(win, fail);

                        runs(function() {
                            expect(win).toHaveBeenCalled();
                            expect(fail).not.toHaveBeenCalled();
                        });
                    });

                    // requestFileSystem
                    runs(function() {
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, resolveCallback, fail);
                    });

                    waitsFor(function() { return resolveCallback.wasCalled; }, "createFile callback never called", Tests.TEST_TIMEOUT);
                });
                it("file.xface.spec.4 should error (SECURITY_ERR) when resolving workspace parent", function() {
                    var fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error.code).toBe(FileError.SECURITY_ERR);
                    }),
                    win = createDoNotCallSpy('window.resolveLocalFileSystemURI');
                    resolveCallback = jasmine.createSpy().andCallFake(function(fileSystem) {
                        // lookup file system entry
                        runs(function() {
                            //remove workspace key word
                            fileSystem.root.fullPath = fileSystem.root.fullPath.replace('workspace', '');
                            window.resolveLocalFileSystemURI(fileSystem.root.toURL(), win, fail);
                        });

                        waitsForAny(win, fail);

                        runs(function() {
                            expect(fail).toHaveBeenCalled();
                            expect(win).not.toHaveBeenCalled();
                        });
                    });

                    // requestFileSystem
                    runs(function() {
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, resolveCallback, fail);
                    });

                    waitsFor(function() { return resolveCallback.wasCalled; }, "createFile callback never called", Tests.TEST_TIMEOUT);
                });
            });
        });

        describe('DirectoryEntry', function() {
            it("file.xface.spec.5 getFile: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var fileName = "de.file",
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('DirectoryEntry');

                // create:false, exclusive:false, file does not exist
                runs(function() {
                    root.fullPath = root.fullPath.replace('workspace', '');
                    root.getFile(fileName, {create:false}, win, fail);
                    root.fullPath = root.fullPath + 'workspace';
                });

                waitsFor(function() { return fail.wasCalled; }, "error callback never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.6 getFile: should error (INVALID_MODIFICATION_ERR) when fileName points to workspace parent dir", function() {
                var fileName = "../de.file",
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('DirectoryEntry');

                // create:false, exclusive:false, file does not exist
                runs(function() {
                    root.getFile(fileName, {create:false}, win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "error callback never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.7 DirectoryEntry.getDirectory: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var dirName = "de.dir",
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('DirectoryEntry');

                // create:false, exclusive:false, directory does not exist
                runs(function() {
                    root.fullPath = root.fullPath.replace('workspace', '');
                    root.getDirectory(dirName, {create:false}, win, fail);
                    root.fullPath = root.fullPath + 'workspace';
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.8 DirectoryEntry.getDirectory: should error (INVALID_MODIFICATION_ERR) when fileName points to workspace parent dir", function() {
                var dirName = "../../de.dir",
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('DirectoryEntry');

                // create:false, exclusive:false, directory does not exist
                runs(function() {
                    root.getDirectory(dirName, {create:false}, win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.9 DirectoryEntry.removeRecursively on workspace parent: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new DirectoryEntry('entry.workspace.parent.dir', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.removeRecursively(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.10 DirectoryEntry.removeRecursively on workspace: should error (NO_MODIFICATION_ALLOWED_ERR) when fullPath points to workspace dir", function() {
                var entry = new DirectoryEntry('entry.workspace.dir', root.fullPath),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.NO_MODIFICATION_ALLOWED_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.removeRecursively(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.11 DirectoryEntry.removeRecursively on root file system", function() {
                var itRemove = jasmine.createSpy().andCallFake(function(error) {
                    expect(error).toBeDefined();
                    expect(error).toBeFileError(FileError.NO_MODIFICATION_ALLOWED_ERR);
                }),
                win = createWin('Entry');

                // remove entry that doesn't exist
                runs(function() {
                    root.removeRecursively(win, itRemove);
                });

                waitsFor(function() { return itRemove.wasCalled; }, "itRemove never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(win).not.toHaveBeenCalled();
                    expect(itRemove).toHaveBeenCalled();
                });
            });
        });

        describe('DirectoryReader', function() {
            describe("readEntries", function() {
                it("file.xface.spec.12 should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                    var reader,
                        fail = jasmine.createSpy().andCallFake(function(error) {
                            expect(error).toBeDefined();
                            expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                        }),
                        win = createWin('DirectoryReader');

                    // create reader for root directory
                    root.fullPath = root.fullPath.replace('workspace', '');
                    reader = root.createReader();
                    root.fullPath = root.fullPath + 'workspace';
                    // read entries
                    runs(function() {
                        reader.readEntries(win, fail);
                    });

                    waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                    runs(function() {
                        expect(fail).toHaveBeenCalled();
                        expect(win).not.toHaveBeenCalled();
                    });
                });
            });
        });

        describe('FileEntry', function() {
            it("file.xface.spec.13 file: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var fileEntry = new FileEntry('fe.name', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('FileEntry');

                runs(function() {
                    fileEntry.file(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
        });
        describe('Entry', function() {
            it("file.xface.spec.14 Entry.getMetadata on file: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new Entry(true, false, 'entry.metadata.file', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.getMetadata(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.15 Entry.getMetadata on directory: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.metadata.dir', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.getMetadata(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.16 Entry.setMetadata on file: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new Entry(true, false, 'entry.metadata.file', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeUndefined();
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.setMetadata(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.17 Entry.setMetadata on directory: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.metadata.dir', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeUndefined();
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.setMetadata(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.18 Entry.getParent on file in root file system", function() {
                var entry = new Entry(true, false, 'entry.parent.file', root.fullPath),
                    win = jasmine.createSpy().andCallFake(function(parent) {
                        expect(parent).toBeDefined();
                        expect(parent.name).toBe("workspace");
                        expect(parent.fullPath).toCanonicallyMatch(root.fullPath);
                    }),
                    fail = createFail('Entry');

                runs(function() {
                    entry.getParent(win, fail);
                });

                waitsFor(function() { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(win).toHaveBeenCalled();
                    expect(fail).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.19 Entry.getParent on file: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new Entry(true, false, 'entry.parent.file', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.getParent(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.20 Entry.getParent on directory in root file system", function() {
                var entry = new Entry(false, true, 'entry.parent.dir', root.fullPath),
                    win = jasmine.createSpy().andCallFake(function(parent) {
                        expect(parent).toBeDefined();
                        expect(parent.name).toBe("workspace");
                        expect(parent.fullPath).toCanonicallyMatch(root.fullPath);
                    }),
                    fail = createFail('Entry');

                runs(function() {
                    entry.getParent(win, fail);
                });

                waitsFor(function() { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(win).toHaveBeenCalled();
                    expect(fail).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.21 Entry.getParent on directory: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.parent.dir', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.getParent(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.22 Entry.getParent on workspace", function() {
                var entry = new Entry(false, true, 'entry.workspace.dir', root.fullPath),
                    itParent = jasmine.createSpy().andCallFake(function(parent) {
                        expect(parent).toBeDefined();
                        expect(parent.name).toBe("workspace");
                        expect(parent.fullPath).toCanonicallyMatch(root.fullPath);
                    }),
                    fail = createFail('Entry');

                runs(function() {
                    entry.getParent(itParent, fail);
                });

                waitsFor(function() { return itParent.wasCalled; }, "itParent never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(itParent).toHaveBeenCalled();
                    expect(fail).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.23 Entry.getParent on root file system", function() {
                var rootPath = root.fullPath,
                    itParent = jasmine.createSpy().andCallFake(function(parent) {
                        expect(parent).toBeDefined();
                        expect(parent.name).toBe("workspace");
                        expect(parent.fullPath).toCanonicallyMatch(rootPath);
                    }),
                    fail = createFail('Entry');

                runs(function() {
                    root.getParent(itParent, fail);
                });

                waitsFor(function() { return itParent.wasCalled; }, "itParent never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(itParent).toHaveBeenCalled();
                    expect(fail).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.24 Entry.remove on workspace parent: should error (INVALID_MODIFICATION_ERR) when fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.workspace.parent.dir', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.remove(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.25 Entry.remove on workspace: should error (NO_MODIFICATION_ALLOWED_ERR) when fullPath points to workspace dir", function() {
                var entry = new Entry(false, true, 'entry.workspace.dir', root.fullPath),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.NO_MODIFICATION_ALLOWED_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.remove(win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.26 Entry.remove on root file system", function() {
                var itRemove = jasmine.createSpy().andCallFake(function(error) {
                    expect(error).toBeDefined();
                    expect(error).toBeFileError(FileError.NO_MODIFICATION_ALLOWED_ERR);
                }),
                win = createWin('Entry');

                // remove entry that doesn't exist
                runs(function() {
                    root.remove(win, itRemove);
                });

                waitsFor(function() { return itRemove.wasCalled; }, "itRemove never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(win).not.toHaveBeenCalled();
                    expect(itRemove).toHaveBeenCalled();
                });
            });
            it("file.xface.spec.27 copyTo file: should error (INVALID_MODIFICATION_ERR) when src file fullPath points to workspace parent dir", function() {
                var entry = new Entry(true, false, 'entry.copy.file', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.copyTo(root, "entry.copy.dest.file", win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.28 copyTo directory: should error (INVALID_MODIFICATION_ERR) when src directory fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.copy.dir', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.copyTo(root, "entry.copy.dest.dir", win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.29 copyTo file: should error (INVALID_MODIFICATION_ERR) when src dest file fullPath points to workspace parent dir", function() {
                var entry = new Entry(true, false, 'entry.copy.file', root.fullPath),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.copyTo(root, "../entry.copy.dest.file", win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.30 copyTo directory: should error (INVALID_MODIFICATION_ERR) when dest directory fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.copy.dir', root.fullPath),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    root.fullPath = root.fullPath.replace('workspace', '');
                    entry.copyTo(root, "entry.copy.dest.dir", win, fail);
                    root.fullPath = root.fullPath + 'workspace';
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.31 moveTo file: should error (INVALID_MODIFICATION_ERR) when src file fullPath points to workspace parent dir", function() {
                var entry = new Entry(true, false, 'entry.move.file', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.moveTo(root, "entry.move.dest.file", win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.32 moveTo directory: should error (INVALID_MODIFICATION_ERR) when src directory fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.move.dir', root.fullPath.replace('workspace', '')),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.moveTo(root, "entry.move.dest.dir", win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.33 moveTo file: should error (INVALID_MODIFICATION_ERR) when src dest file fullPath points to workspace parent dir", function() {
                var entry = new Entry(true, false, 'entry.move.file', root.fullPath),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    root.fullPath = root.fullPath.replace('workspace', '');
                    entry.moveTo(root, "entry.move.dest.file", win, fail);
                    root.fullPath = root.fullPath + 'workspace';
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
            it("file.xface.spec.34 moveTo directory: should error (INVALID_MODIFICATION_ERR) when dest directory fullPath points to workspace parent dir", function() {
                var entry = new Entry(false, true, 'entry.move.dir', root.fullPath),
                    fail = jasmine.createSpy().andCallFake(function(error) {
                        expect(error).toBeDefined();
                        expect(error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                    }),
                    win = createWin('Entry');

                runs(function() {
                    entry.moveTo(root, "../entry.move.dest.dir", win, fail);
                });

                waitsFor(function() { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

                runs(function() {
                    expect(fail).toHaveBeenCalled();
                    expect(win).not.toHaveBeenCalled();
                });
            });
        });
        describe('read method', function(){
            it("file.xface.spec.35 readAsText: should error (INVALID_MODIFICATION_ERR) when file fullPath points to workspace parent dir", function() {
                var reader = new FileReader();
                var verifier = jasmine.createSpy().andCallFake(function(evt) {
                    expect(evt).toBeDefined();
                    expect(evt.target.error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                });
                reader.onerror = verifier;
                var myFile = new File();
                myFile.fullPath = root.fullPath.replace('workspace', '');

                reader.readAsText(myFile);

                waitsFor(function() { return verifier.wasCalled; }, "verifier never called", Tests.TEST_TIMEOUT);
            });
            it("file.xface.spec.36 readAsDataURL: should error (INVALID_MODIFICATION_ERR) when file fullPath points to workspace parent dir", function() {
                var reader = new FileReader();
                var verifier = jasmine.createSpy().andCallFake(function(evt) {
                    expect(evt).toBeDefined();
                    expect(evt.target.error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                });
                reader.onerror = verifier;
                var myFile = new File();
                myFile.fullPath = root.fullPath + '/../invalid.modification.err';

                reader.readAsDataURL(myFile);

                waitsFor(function() { return verifier.wasCalled; }, "verifier never called", Tests.TEST_TIMEOUT);
            });
            it("file.xface.spec.37 readAsBinaryString: should error (INVALID_MODIFICATION_ERR) when file fullPath points to workspace parent dir", function() {
                var reader = new FileReader();
                var verifier = jasmine.createSpy().andCallFake(function(evt) {
                    expect(evt).toBeDefined();
                    expect(evt.target.error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                });
                reader.onerror = verifier;
                var myFile = new File();
                myFile.fullPath = root.fullPath + '/../../invalid.modification.err';

                reader.readAsBinaryString(myFile);

                waitsFor(function() { return verifier.wasCalled; }, "verifier never called", Tests.TEST_TIMEOUT);
            });
            it("file.xface.spec.38 readAsArrayBuffer: should error (INVALID_MODIFICATION_ERR) when file fullPath points to workspace parent dir", function() {
                var reader = new FileReader();
                var verifier = jasmine.createSpy().andCallFake(function(evt) {
                    expect(evt).toBeDefined();
                    expect(evt.target.error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                });
                reader.onerror = verifier;
                var myFile = new File();
                myFile.fullPath = root.fullPath.replace('workspace', '');

                reader.readAsArrayBuffer(myFile);

                waitsFor(function() { return verifier.wasCalled; }, "verifier never called", Tests.TEST_TIMEOUT);
            });
        });

        describe('FileWriter', function(){
            it("file.xface.spec.39 write: should error (INVALID_MODIFICATION_ERR) when file fullPath points to workspace parent dir", function() {
                var myFile = new File();
                myFile.fullPath = root.fullPath.replace('workspace', '');
                var writer = new FileWriter(myFile),
                    rule = "This is our sentence.";
                var verifier = jasmine.createSpy().andCallFake(function(evt) {
                    expect(evt).toBeDefined();
                    expect(evt.target.error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                });
                writer.onwriteend = verifier;
                writer.write(rule);

                waitsFor(function() { return verifier.wasCalled; }, "verifier never called", Tests.TEST_TIMEOUT);
            });
            it("file.xface.spec.40 truncate: should error (INVALID_MODIFICATION_ERR) when file fullPath points to workspace parent dir", function() {
                var myFile = new File();
                myFile.fullPath = root.fullPath.replace('workspace', '');
                var writer = new FileWriter(myFile),
                    rule = "This is our sentence.";
                var verifier = jasmine.createSpy().andCallFake(function(evt) {
                    expect(evt).toBeDefined();
                    expect(evt.target.error).toBeFileError(FileError.INVALID_MODIFICATION_ERR);
                });
                writer.onwriteend = verifier;
                writer.truncate(36);

                waitsFor(function() { return verifier.wasCalled; }, "verifier never called", Tests.TEST_TIMEOUT);
            });
        });
    });

     describe('File slice', function() {
        it("file.xface.spec.41 should define File attributes", function() {
            var file = new File();
            expect(file.name).toBeDefined();
            expect(file.fullPath).toBeDefined();
            expect(file.type).toBeDefined();
            expect(file.lastModifiedDate).toBeDefined();
            expect(file.size).toBeDefined();
            expect(file.start).toBeDefined();
            expect(file.end).toBeDefined();
            expect(typeof file.slice).toBe('function');
        });
        it("file.xface.spec.42 slice file whose size is 0",function()
        {
            var file = new File();
            var slicedFile = file.slice(2, 5);
            expect(slicedFile.start).toBe(0);
            expect(slicedFile.end).toBe(0);
        });
        it("file.xface.spec.43 slice file whose size is not 0",function()
        {
            var file = new File('', null, null, null, 10);
            var slicedFile = file.slice(2, 5);
            expect(slicedFile.start).toBe(2);
            expect(slicedFile.end).toBe(5);
        });
        it("file.xface.spec.44 slice file when start is less than 0",function()
        {
            var file = new File('', null, null, null, 10);
            var slicedFile = file.slice(-2, 5);
            expect(slicedFile.start).toBe(8);
            expect(slicedFile.end).toBe(5);
        });
        it("file.xface.spec.45 slice file when start is bigger than size",function()
        {
            var file = new File('', null, null, null, 10);
            var slicedFile = file.slice(20, 5);
            expect(slicedFile.start).toBe(10);
            expect(slicedFile.end).toBe(5);
        });
        it("file.xface.spec.46 slice file when end is less than 0",function()
        {
            var file = new File('', null, null, null, 10);
            var slicedFile = file.slice(2, -5);
            expect(slicedFile.start).toBe(2);
            expect(slicedFile.end).toBe(5);
        });
        it("file.xface.spec.47 slice file when end is bigger than size",function()
        {
            var file = new File('', null, null, null, 10);
            var slicedFile = file.slice(2, 50);
            expect(slicedFile.start).toBe(2);
            expect(slicedFile.end).toBe(10);
        });
    });

    describe('FileWriter', function(){
        it("file.xface.spec.48 should be able to write and read special characters", function() {
            var fileName = "reader.txt",
                filePath = root.fullPath + fileName,
                theWriter,
                theFileEntry,
                // file content
                rule = "H\u00EBll\u00F5 Euro \u20AC\u00A1",
                fail = createFail('FileWriter'),
                // creates a FileWriter object
                create_writer = function(fileEntry) {
                    theFileEntry = fileEntry;
                    fileEntry.createWriter(write_file, fail);
                },
                verifier = jasmine.createSpy().andCallFake(function(evt) {
                    expect(evt).toBeDefined();
                    expect(evt.target.result).toBe(rule);
                    // cleanup
                    deleteFile(fileName);
                }),
                // writes file and reads it back in
                write_file = function(writer) {
                    theWriter = writer;
                    theWriter.onwriteend = get_file;
                    theWriter.write(rule);
                },
                get_file = function(){
                    theFileEntry.file(read_file);
                },
                // reads file and compares content to what was written
                read_file = function(file) {
                    var reader = new FileReader();
                    reader.onloadend = verifier;
                    reader.readAsText(file);
                };

            // create a file, write to it, and read it in again
            runs(function() {
                createFile(fileName, create_writer, fail);
            });

            waitsFor(function() { return verifier.wasCalled; }, "verifier never called", Tests.TEST_TIMEOUT);

            runs(function() {
                expect(verifier).toHaveBeenCalled();
                expect(fail).not.toHaveBeenCalled();
            });
        });
    });
});
