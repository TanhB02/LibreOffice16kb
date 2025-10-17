/* -*- tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */ /*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package org.libreoffice.androidapp.ui

import android.app.Activity
import android.database.Cursor
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import org.libreoffice.androidapp.R
import org.libreoffice.androidlib.utils.UtilsOffice.openFile

internal class RecentFilesAdapter(
    private var mActivity: LibreOfficeUIActivity,
    recentUris: MutableList<Uri>
) : RecyclerView.Adapter<RecentFilesAdapter.ViewHolder?>() {
    private val KB: Long = 1024
    private val MB: Long = 1048576

    private var recentFiles: ArrayList<RecentFile>? = null

    init {
        initRecentFiles(recentUris)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val item = LayoutInflater.from(parent.getContext()).inflate(
            if (mActivity.isViewModeList) R.layout.file_list_item else R.layout.file_explorer_grid_item,
            parent,
            false
        )
        return ViewHolder(item)
    }

    /** Validate uris in case of removed/renamed documents and return RecentFile ArrayList from the valid uris  */
    fun initRecentFiles(recentUris: MutableList<Uri>) {
        this.recentFiles = ArrayList<RecentFile>()
        var invalidUriFound = false
        var joined = ""
        for (u in recentUris) {
            val filename: String? = getUriFilename(mActivity, u)
            if (null != filename) {
                val length: Long = getUriFileLength(mActivity, u)
                recentFiles!!.add(RecentFile(u, filename, length))
                joined = joined + u.toString() + "\n"
            } else invalidUriFound = true
        }
        if (invalidUriFound) {
            mActivity.getPrefs().edit()
                .putString(LibreOfficeUIActivity.Companion.RECENT_DOCUMENTS_KEY, joined).apply()
        }
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val file = recentFiles!!.get(position)

        val clickListener: View.OnClickListener = object : View.OnClickListener {
            override fun onClick(view: View?) {
                mActivity.openFile(file.uri)
                Log.d("RecentFilesAdapter", "onClick: " + file.uri)
            }
        }

        holder.filenameView.setOnClickListener(clickListener)
        holder.imageView.setOnClickListener(clickListener)

        holder.fileActionsImageView.setOnClickListener(object : View.OnClickListener {
            override fun onClick(view: View) {
                mActivity.openContextMenu(view, file.uri)
            }
        })

        val filename = file.filename
        val length = file.fileLength

        // TODO Date not available now
        //Date date = null;
        holder.filenameView.setText(filename)

        var compoundDrawableInt = 0

        when (FileUtilities.getType(filename)) {
            FileUtilities.DOC -> compoundDrawableInt = R.drawable.writer
            FileUtilities.CALC -> compoundDrawableInt = R.drawable.calc
            FileUtilities.DRAWING -> compoundDrawableInt = R.drawable.draw
            FileUtilities.IMPRESS -> compoundDrawableInt = R.drawable.impress
            FileUtilities.PDF -> compoundDrawableInt = R.drawable.pdf
        }

        if (compoundDrawableInt != 0) holder.imageView.setImageDrawable(
            ContextCompat.getDrawable(
                mActivity,
                compoundDrawableInt
            )
        )

        // Date and Size field only exist when we are displaying items in a list.
        if (mActivity.isViewModeList) {
            val size: String?
            var unit = "B"
            if (length < KB) {
                size = length.toString()
            } else if (length < MB) {
                size = (length / KB).toString()
                unit = "KB"
            } else {
                size = (length / MB).toString()
                unit = "MB"
            }
            holder.fileSizeView!!.setText(size)
            holder.fileSizeUnitView!!.setText(unit)

            /* TODO Date not available now
            if (date != null) {
                SimpleDateFormat df = new SimpleDateFormat("dd MMM yyyy hh:ss");
                //TODO format date
                holder.fileDateView.setText(df.format(date));
            }
            */
        }
    }

    override fun getItemCount(): Int {
        if (recentFiles!!.size == 0) {
            mActivity.noRecentItemsTextView!!.setVisibility(View.VISIBLE)
        } else {
            mActivity.noRecentItemsTextView!!.setVisibility(View.GONE)
        }
        return recentFiles!!.size
    }

    internal inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        var filenameView: TextView
        var fileSizeView: TextView? = null
        var fileSizeUnitView: TextView? = null /*, fileDateView*/
        var imageView: ImageView
        var fileActionsImageView: ImageView

        init {
            this.filenameView = itemView.findViewById<TextView>(R.id.file_item_name)
            this.imageView = itemView.findViewById<ImageView>(R.id.file_item_icon)
            this.fileActionsImageView = itemView.findViewById<ImageView>(R.id.file_actions_button)
            // Check if view mode is List, only then initialise Size and Date field
            if (mActivity.isViewModeList) {
                fileSizeView = itemView.findViewById<TextView>(R.id.file_item_size)
                fileSizeUnitView = itemView.findViewById<TextView>(R.id.file_item_size_unit)
                //fileDateView = itemView.findViewById(R.id.file_item_date);
            }
        }
    }

    /** Cache the name & size so that we don't have ask later.  */
    private inner class RecentFile(var uri: Uri?, var filename: String?, var fileLength: Long)
    companion object {
        /** Return the filename of the given Uri.  */
        fun getUriFilename(activity: Activity, uri: Uri): String? {
            var filename = ""
            var cursor: Cursor? = null
            try {
                cursor = activity.getContentResolver().query(uri, null, null, null, null)
                if (cursor != null && cursor.moveToFirst()) filename =
                    cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME))
            } catch (e: Exception) {
                return null
            } finally {
                if (cursor != null) cursor.close()
            }

            if (filename.isEmpty()) return null

            return filename
        }

        /** Return the size of the given Uri.  */
        fun getUriFileLength(activity: Activity, uri: Uri): Long {
            var length: Long = 0
            var cursor: Cursor? = null
            try {
                cursor = activity.getContentResolver().query(uri, null, null, null, null)
                if (cursor != null && cursor.moveToFirst()) length =
                    cursor.getLong(cursor.getColumnIndexOrThrow(OpenableColumns.SIZE))
            } catch (e: Exception) {
                return 0
            } finally {
                if (cursor != null) cursor.close()
            }

            if (length == 0L) {
                // TODO maybe try to get File & return File.length()?
            }

            return length
        }
    }
} /* vim:set shiftwidth=4 softtabstop=4 expandtab: */

