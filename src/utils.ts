import axios from 'axios';
import fs from 'fs';
import http from 'http';
import _ from 'lodash';

import { IPackageDeclaration } from './types';

const npmRegistryUrl = 'http://registry.npmjs.org/';

export const findPackageJson = (): string => {
  // TODO: search for the package in current directory
  return 'package.json';
};

export const getPackageDeclarations = (depsStr: { [pckgName: string]: string }): IPackageDeclaration[] => {
  return _(depsStr)
    .toPairs()
    .map(pair => ({ name: pair[0], version: pair[1] }))
    .value();
};

export const parsePackageJson = (path: string): IPackageDeclaration[] => {
  // also add runtime checks
  const contentsStr = fs.readFileSync(path, 'utf8');
  const contents = JSON.parse(contentsStr);
  const packages = getPackageDeclarations(contents.dependencies);
  console.log(packages);
  return packages;
};

const fetchTarballUrls = (pckgUrls: string[]) => {
  const promises = pckgUrls.map(url => axios.get(url));
  console.log(promises);
  axios.all(promises).then(
    axios.spread((...params) => {
      console.log('got the data');
    })
  );
};

const getLatestVersionFromChunk = (chunk: string): string | null => {
  const strToSearch = 'dist-tags":{"latest":"';
  const distPos = chunk.indexOf(strToSearch);
  if (distPos !== -1) {
    const versionNumDirty: string = chunk.slice(
      distPos + strToSearch.length,
      distPos + strToSearch.length + 30
    );
    const versionNum = versionNumDirty.split('"')[0];
    return versionNum;
  } else {
    return null;
  }
};

const getLatestVersionNumberOfPackage = (pckg: IPackageDeclaration): Promise<IPackageDeclaration> => {
  return new Promise((success, fail) => {
    const req = http
      .get(npmRegistryUrl + pckg.name, res => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType || 'nothing')) {
          error = new Error(
            'Invalid content-type.\n' + `Expected application/json but received ${contentType}`
          );
        }
        if (error) {
          res.resume();
          fail(error.message);
          return;
        }

        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          const versionNum = getLatestVersionFromChunk(chunk);
          if (versionNum) {
            req.abort();
            success({ name: pckg.name, version: versionNum });
          }
        });
      })
      .on('error', e => {
        fail(e.message);
      });
  });
};

const downloadTarball = (pckg: IPackageDeclaration): Promise<boolean> => {
  // https://registry.npmjs.org/lodash/-/lodash-0.2.0.tgz
  if (!fs.existsSync('_node_modules')) {
    fs.mkdirSync('_node_modules');
  }
  if (!fs.existsSync(`_node_modules/@types`)) {
    fs.mkdirSync(`_node_modules/@types`);
  }
  if (!fs.existsSync(`_node_modules/@types/${pckg.name}`)) {
    fs.mkdirSync(`_node_modules/@types/${pckg.name}`);
  }
  return new Promise((success, fail) => {
    const file = fs.createWriteStream(`_node_modules/${pckg.name}`);
    const url = npmRegistryUrl + pckg.name + '/-/' + pckg.name + '-' + pckg.version;
    const request = http.get(url, res => {
      res.pipe(file);
      res.on('end', () => {
        success(true);
      });
    });
    request.on('error', e => {
      fail(e.message);
    });
  });
};

export const downloadPackages = async (packages: IPackageDeclaration[]) => {
  // download the package info for each package name e.g. http://registry.npmjs.org/mobx
  const promises = packages.map(pckg => getLatestVersionNumberOfPackage(pckg));
  const newestPackages = await Promise.all(promises);

  console.log('newestPackages', newestPackages);
  await downloadTarball(newestPackages[0]);
  // console.log(res.status);
  // const urls = packages.map(p => npmRegistryUrl + p.name);
  // fetchTarballUrls(urls);
  // packages.forEach(async (pckg: IPackageDeclaration) => {
  //   const pckgData = await axios.get(npmRegistryUrl + pckg.name);
  // add assertions here
  //   const latestVersion: string = pckgData.data['dist-tags'].latest;
  // add assertions here as well
  //   const tarballUrl: string = pckgData.data.versions[latestVersion].dist.tarball;
  //   console.log(tarballUrl);
  // });

  // check the dist-tags for the latest version
  // download the tarball at versions.[version#].dist.tarball
  // unpack the tarball
  // put the contents in _node_modules, save the meta-data about the package in memory
  //
  // const result = await axios.get('https://google.com', {});
  // console.log(result.data);
};
