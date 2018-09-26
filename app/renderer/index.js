const os = require('os');
const fs = require('fs');
const path = require('path');

const filemanager = document.querySelector('.filemanager');
const nothingFound = filemanager.querySelector('.nothingfound');
const breadcrumbs = document.querySelector('.breadcrumbs');
const fileList = document.querySelector('.data');
let breadcrumbsUrls = [];

const listFilesAndDirectories = directoryPath => {
  const directoryListings = [];
  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    const stats = fs.statSync(path.join(directoryPath, file));
    const data = {
      name: file,
      path: path.join(directoryPath, file),
      isDirectory: stats.isDirectory()
    };
    if (data.isDirectory) {
      // data.subDirectoryLength = fs.readdirSync(data.path).length;
      data.subDirectoryLength = 0;
    } else {
      data.size = bytesToSize(stats.size);
    }
    directoryListings.push(data);
  });

  breadcrumbsUrls = generateBreadcrumbs(directoryPath);
  render(directoryListings);
};

// Splits a file path and turns it into clickable breadcrumbs
const generateBreadcrumbs = nextDir => {
  return nextDir.split(path.sep);
};

// This function escapes special html characters in names
const escapeHTML = text => {
  return text
    .replace(/\&/g, '&amp;')
    .replace(/\</g, '&lt;')
    .replace(/\>/g, '&gt;');
};

// Convert file sizes from bytes to human readable units
const bytesToSize = bytes => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

// Construct the name depending on number of items in the sub directory
const getSubDirectoryCount = count => {
  if (count == 1) {
    return `${count} ' item'`;
  } else if (count > 1) {
    return `${count} ' items'`;
  }
  return 'Empty';
};

// Render the HTML for the file manager
render = files => {
  const scannedFolders = [],
    scannedFiles = [];

  if (Array.isArray(files)) {
    files.forEach(file => {
      if (file.isDirectory) {
        scannedFolders.push(file);
      } else {
        scannedFiles.push(file);
      }
    });
  }

  // Empty the old result and make the new one with new eventListeners
  fileList.innerHTML = '';
  fileList.style.display = 'block';

  nothingFound.style.display =
    !scannedFolders.length && !scannedFiles.length ? 'block' : 'none';

  if (scannedFolders.length) {
    scannedFolders.forEach(folder => {
      const itemsLength = folder.subDirectoryLength,
        name = escapeHTML(folder.name);
      let icon = '<span class="icon folder"></span>';

      if (!!itemsLength) {
        icon = '<span class="icon folder full"></span>';
      }

      const folderHTML = `
        <li class="folders">
          <a href="${folder.path}" title="${folder.path}" class="folders">
            ${icon}
            <span class="name">${name}</span>
            <span class="details">${getSubDirectoryCount(itemsLength)}</span>
          </a>
        </li>
      `;

      fileList.innerHTML += folderHTML;
    });
  }

  if (scannedFiles.length) {
    scannedFiles.forEach(file => {
      const name = escapeHTML(file.name),
        fileType = name.split('.')[name.split('.').length - 1];
      let icon = '<span class="icon file"></span>';

      icon =
        '<span class="icon file f-' + fileType + '">.' + fileType + '</span>';

      const fileHTML = `
        <li class="files">
          <a href="${file.path}" title="${file.path}" class="files">
            ${icon}
            <span class="name">${name}</span>
            <span class="details">${file.size}</span>
          </a>
        </li>
      `;

      fileList.innerHTML += fileHTML;
    });
  }

  // Generate the breadcrumbs

  let url = '';

  if (filemanager.classList.contains('searching')) {
    url = '<span>Search results: </span>';
    fileList.classList.remove('animated');
  } else {
    fileList.classList.add('animated');

    for (let i = 0; i < breadcrumbsUrls.length; i++) {
      const breadcrumPathArray = breadcrumbsUrls.slice(0, i + 1);
      const breadcrumPath = path.join(...breadcrumPathArray);
      url += `
        <a href="${breadcrumPath}">
          <span class="folderName">
            ${breadcrumbsUrls[i]}
          </span>
        </a>
      `;

      if (!!breadcrumbsUrls[i + 1]) {
        url += '<span class="arrow">&raquo</span> ';
      }
    }
  }

  breadcrumbs.innerHTML = '';
  breadcrumbs.innerHTML = url;

  // Show the generated elements

  // fileList.animate({ display: 'inline-block' });
};

// listFilesAndDirectories(os.homedir() + '/Desktop');
listFilesAndDirectories(path.join(os.homedir(), 'Desktop'));
