/* -*- tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */ /*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package org.libreoffice.androidapp.ui

import android.util.Log
import android.webkit.MimeTypeMap
import java.io.File
import java.io.FileFilter
import java.io.FilenameFilter

object FileUtilities {
    private val LOGTAG: String = FileUtilities::class.java.getSimpleName()

    val ALL: Int = -1

    // These have to be in sync with the file_view_modes resource.
    const val DOC: Int = 0
    const val CALC: Int = 1
    const val IMPRESS: Int = 2
    const val DRAWING: Int = 3
    const val PDF: Int = 4

    const val UNKNOWN: Int = 10

    const val SORT_AZ: Int = 0
    const val SORT_ZA: Int = 1

    /** Oldest Files First */
    const val SORT_OLDEST: Int = 2

    /** Newest Files First */
    const val SORT_NEWEST: Int = 3

    /** Largest Files First  */
    const val SORT_LARGEST: Int = 4

    /** Smallest Files First  */
    const val SORT_SMALLEST: Int = 5

    const val DEFAULT_WRITER_EXTENSION: String = ".odt"
    const val DEFAULT_IMPRESS_EXTENSION: String = ".odp"
    const val DEFAULT_SPREADSHEET_EXTENSION: String = ".ods"
    const val DEFAULT_DRAWING_EXTENSION: String = ".odg"

    private val mExtnMap: MutableMap<String?, Int?> = HashMap<String?, Int?>()
    private val extensionToMimeTypeMap: MutableMap<String?, String?> = HashMap<String?, String?>()

    init {
        // Please keep this in sync with AndroidManifest.xml

        // ODF

        mExtnMap.put(".odt", DOC)
        mExtnMap.put(".odg", DRAWING)
        mExtnMap.put(".odp", IMPRESS)
        mExtnMap.put(".ods", CALC)
        mExtnMap.put(".fodt", DOC)
        mExtnMap.put(".fodg", DRAWING)
        mExtnMap.put(".fodp", IMPRESS)
        mExtnMap.put(".fods", CALC)
        mExtnMap.put(".pdf", PDF)

        // ODF templates
        mExtnMap.put(".ott", DOC)
        mExtnMap.put(".otg", DRAWING)
        mExtnMap.put(".otp", IMPRESS)
        mExtnMap.put(".ots", CALC)

        // MS
        mExtnMap.put(".rtf", DOC)
        mExtnMap.put(".doc", DOC)
        mExtnMap.put(".vsd", DRAWING)
        mExtnMap.put(".vsdx", DRAWING)
        mExtnMap.put(".pub", DRAWING)
        mExtnMap.put(".ppt", IMPRESS)
        // mExtnMap.put(".pps",  IMPRESS);
        mExtnMap.put(".xls", CALC)
        mExtnMap.put(".xlsb", CALC)
        mExtnMap.put(".xlsm", CALC)

        // MS templates
        mExtnMap.put(".dot", DOC)
        mExtnMap.put(".pot", IMPRESS)
        mExtnMap.put(".xlt", CALC)

        // OOXML
        mExtnMap.put(".docx", DOC)
        mExtnMap.put(".pptx", IMPRESS)
        // mExtnMap.put(".ppsx", IMPRESS);
        mExtnMap.put(".xlsx", CALC)

        // OOXML templates
        mExtnMap.put(".dotx", DOC)
        mExtnMap.put(".potx", IMPRESS)
        mExtnMap.put(".xltx", CALC)

        // Other
        mExtnMap.put(".csv", CALC)
        mExtnMap.put(".txt", DOC)
        mExtnMap.put(".wps", DOC)
        mExtnMap.put(".key", IMPRESS)
        mExtnMap.put(".abw", DOC)
        mExtnMap.put(".pmd", DRAWING)
        mExtnMap.put(".emf", DRAWING)
        mExtnMap.put(".svm", DRAWING)
        mExtnMap.put(".wmf", DRAWING)
        mExtnMap.put(".svg", DRAWING)

        // Some basic MIME types
        // Android's MimeTypeMap lacks some types that we need
        extensionToMimeTypeMap.put("odb", "application/vnd.oasis.opendocument.database")
        extensionToMimeTypeMap.put("odf", "application/vnd.oasis.opendocument.formula")
        extensionToMimeTypeMap.put("odg", "application/vnd.oasis.opendocument.graphics")
        extensionToMimeTypeMap.put("otg", "application/vnd.oasis.opendocument.graphics-template")
        extensionToMimeTypeMap.put("odi", "application/vnd.oasis.opendocument.image")
        extensionToMimeTypeMap.put("odp", "application/vnd.oasis.opendocument.presentation")
        extensionToMimeTypeMap.put(
            "otp",
            "application/vnd.oasis.opendocument.presentation-template"
        )
        extensionToMimeTypeMap.put("ods", "application/vnd.oasis.opendocument.spreadsheet")
        extensionToMimeTypeMap.put("ots", "application/vnd.oasis.opendocument.spreadsheet-template")
        extensionToMimeTypeMap.put("odt", "application/vnd.oasis.opendocument.text")
        extensionToMimeTypeMap.put("odm", "application/vnd.oasis.opendocument.text-master")
        extensionToMimeTypeMap.put("ott", "application/vnd.oasis.opendocument.text-template")
        extensionToMimeTypeMap.put("oth", "application/vnd.oasis.opendocument.text-web")
        extensionToMimeTypeMap.put("txt", "text/plain")
    }

    fun getExtension(filename: String?): String {
        if (filename == null) return ""
        val nExt = filename.lastIndexOf('.')
        if (nExt < 0) return ""
        return filename.substring(nExt)
    }

    private fun lookupExtension(filename: String?): Int {
        val extn = getExtension(filename)
        if (!mExtnMap.containsKey(extn)) return UNKNOWN
        return mExtnMap.get(extn)!!
    }

    fun getType(filename: String?): Int {
        val type = lookupExtension(filename)
        Log.d(LOGTAG, "extn : " + filename + " -> " + type)
        return type
    }

    fun getMimeType(filename: String?): String? {
        val extension = MimeTypeMap.getFileExtensionFromUrl(filename)
        var mime = extensionToMimeTypeMap.get(extension)
        if (mime == null) {
            //fallback to Android's MimeTypeMap
            mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(
                extension
            )
        }
        return mime
    }

    // Filter by mode, and/or in future by filename/wildcard
    private fun doAccept(filename: String?, byMode: Int, byFilename: String): Boolean {
        Log.d(LOGTAG, "doAccept : " + filename + " mode " + byMode + " byFilename " + byFilename)
        if (filename == null) return false

        // check extension
        if (byMode != ALL) {
            if (mExtnMap.get(getExtension(filename)) != byMode) return false
        }
        if (byFilename != "") {
            // FIXME return false on a non-match
        }
        return true
    }

    fun getFileFilter(mode: Int): FileFilter {
        return object : FileFilter {
            override fun accept(pathname: File): Boolean {
                if (pathname.isDirectory()) return true
                if (lookupExtension(pathname.getName()) == UNKNOWN) return false
                return doAccept(pathname.getName(), mode, "")
            }
        }
    }

    fun getFilenameFilter(mode: Int): FilenameFilter {
        return object : FilenameFilter {
            override fun accept(dir: File?, filename: String): Boolean {
                if (File(dir, filename).isDirectory()) return true
                return doAccept(filename, mode, "")
            }
        }
    }

    /*
    static void sortFiles(List<IFile> files, int sortMode) {
        if (files == null)
            return;
        // Compare filenames in the default locale
        final Collator mCollator = Collator.getInstance();
        switch (sortMode) {
            case SORT_AZ:
                Collections.sort(files , new Comparator<IFile>() {
                    public int compare(IFile lhs, IFile rhs) {
                        return mCollator.compare(lhs.getName(), rhs.getName());
                    }
                });
                break;
            case SORT_ZA:
                Collections.sort(files , new Comparator<IFile>() {
                    public int compare(IFile lhs, IFile rhs) {
                        return mCollator.compare(rhs.getName(), lhs.getName());
                    }
                });
                break;
            case SORT_OLDEST:
                Collections.sort(files , new Comparator<IFile>() {
                    public int compare(IFile lhs, IFile rhs) {
                        return lhs.getLastModified().compareTo(rhs.getLastModified());
                    }
                });
                break;
            case SORT_NEWEST:
                Collections.sort(files , new Comparator<IFile>() {
                    public int compare(IFile lhs, IFile rhs) {
                        return rhs.getLastModified().compareTo(lhs.getLastModified());
                    }
                });
                break;
            case SORT_LARGEST:
                Collections.sort(files , new Comparator<IFile>() {
                    public int compare(IFile lhs, IFile rhs) {
                        return Long.valueOf(rhs.getSize()).compareTo(lhs.getSize());
                    }
                });
                break;
            case SORT_SMALLEST:
                Collections.sort(files , new Comparator<IFile>() {
                    public int compare(IFile lhs, IFile rhs) {
                        return Long.valueOf(lhs.getSize()).compareTo(rhs.getSize());
                    }
                });
                break;
            default:
                Log.e(LOGTAG, "uncatched sortMode: " + sortMode);
        }
    }
    */
    fun isHidden(file: File): Boolean {
        return file.getName().startsWith(".")
    }

    fun isThumbnail(file: File): Boolean {
        return isHidden(file) && file.getName().endsWith(".png")
    }

    fun hasThumbnail(file: File): Boolean {
        val filename = file.getName()
        if (lookupExtension(filename) == DOC)  // only do this for docs for now
        {
            // Will need another method to check if Thumb is up-to-date - or extend this one?
            return File(file.getParent(), getThumbnailName(file)).isFile()
        }
        return true
    }

    fun getThumbnailName(file: File): String {
        return "." + file.getName().split("[.]".toRegex()).dropLastWhile { it.isEmpty() }
            .toTypedArray()[0] + ".png"
    }
} /* vim:set shiftwidth=4 softtabstop=4 expandtab: */

