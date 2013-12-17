package org.apache.cordova.file;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.ContentResolver;
import android.database.Cursor;
import android.provider.MediaStore;

public class ContentFilesystem implements Filesystem {

	private CordovaInterface cordova;
	
	public ContentFilesystem(CordovaInterface cordova) {
		this.cordova = cordova;
	}
	
	@Override
    @SuppressWarnings("deprecation")
	public JSONObject getEntryForLocalURL(LocalFilesystemURL inputURL) throws IOException {
      File fp = null;

          Cursor cursor = this.cordova.getActivity().managedQuery(inputURL.URL, new String[] { MediaStore.Images.Media.DATA }, null, null, null);
          // Note: MediaStore.Images/Audio/Video.Media.DATA is always "_data"
          int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
          cursor.moveToFirst();
          fp = new File(cursor.getString(column_index));

      if (!fp.exists()) {
          throw new FileNotFoundException();
      }
      if (!fp.canRead()) {
          throw new IOException();
      }
      try {
    	  JSONObject entry = new JSONObject();
    	  entry.put("isFile", fp.isFile());
    	  entry.put("isDirectory", fp.isDirectory());
    	  entry.put("name", fp.getName());
    	  entry.put("fullPath", "file://" + fp.getAbsolutePath());
    	  // The file system can't be specified, as it would lead to an infinite loop.
    	  entry.put("filesystem", FileUtils.APPLICATION);
          return entry;
      } catch (JSONException e) {
    	  throw new IOException();
      }
	}
	@Override
	public JSONObject getFileForLocalURL(LocalFilesystemURL inputURL,
			String fileName, JSONObject options, boolean directory) throws IOException {
		throw new IOException("Cannot create content url");
	}
	@Override
	public boolean removeFileAtLocalURL(LocalFilesystemURL inputURL)
			throws NoModificationAllowedException {
		throw new NoModificationAllowedException("Cannot remove content url");
	}
	@Override
	public boolean recursiveRemoveFileAtLocalURL(LocalFilesystemURL inputURL)
			throws NoModificationAllowedException {
		throw new NoModificationAllowedException("Cannot remove content url");
	}
	@Override
	public JSONArray readEntriesAtLocalURL(LocalFilesystemURL inputURL)
			throws FileNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public JSONObject getFileMetadataForLocalURL(LocalFilesystemURL inputURL) throws FileNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public JSONObject getParentForLocalURL(LocalFilesystemURL inputURL)
			throws IOException {
		// TODO Auto-generated method stub
		// Can probably use same impl as LFS
		return null;
	}
	@Override
	public JSONObject copyFileToURL(LocalFilesystemURL destURL, String newName,
			Filesystem srcFs, LocalFilesystemURL srcURL, boolean move)
			throws IOException, InvalidModificationException, JSONException,
			NoModificationAllowedException, FileExistsException {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public void readFileAtURL(LocalFilesystemURL inputURL, int start, int end,
			ReadFileCallback readFileCallback) throws IOException {
		// TODO Auto-generated method stub
		
	}
	@Override
	public long writeToFileAtURL(LocalFilesystemURL inputURL, String data,
			int offset, boolean isBinary) throws NoModificationAllowedException {
        throw new NoModificationAllowedException("Couldn't write to file given its content URI");
    }
	@Override
	public long truncateFileAtURL(LocalFilesystemURL inputURL, long size)
			throws NoModificationAllowedException {
        throw new NoModificationAllowedException("Couldn't truncate file given its content URI");
	}

    @Override
    public String filesystemPathForURL(LocalFilesystemURL url) {
        final String[] LOCAL_FILE_PROJECTION = { MediaStore.Images.Media.DATA };

        ContentResolver contentResolver = this.cordova.getActivity().getContentResolver();
        Cursor cursor = contentResolver.query(url.URL, LOCAL_FILE_PROJECTION, null, null, null);
        if (cursor != null) {
            try {
                int columnIndex = cursor.getColumnIndex(LOCAL_FILE_PROJECTION[0]);
                if (columnIndex != -1 && cursor.getCount() > 0) {
                    cursor.moveToFirst();
                    String path = cursor.getString(columnIndex);
                    return path;
                }
            } finally {
                cursor.close();
            }
        }
        return null;
    }

	@Override
	public LocalFilesystemURL URLforFilesystemPath(String path) {
		// TODO Auto-generated method stub
		return null;
	}
}
