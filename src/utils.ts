import fs from 'fs';
import http from 'http';
import R from 'ramda';

import { IPackageDeclaration } from './types';

const npmRegistryUrl = 'http://registry.npmjs.org/';
const nodeModulesDir = '_node_modules';

export const findPackageJson = (): string => {
  // TODO: search for the package in current directory
  return 'package.json';
};

export const getPackageDeclarations = (depsStr: { [pckgName: string]: string }): IPackageDeclaration[] => {
  const tupleToObj = (pair: string[]): IPackageDeclaration => ({ name: pair[0], version: pair[1] });
  return R.map(tupleToObj)(R.toPairs(depsStr));
};

export const parsePackageJson = (path: string): IPackageDeclaration[] => {
  // also add runtime checks
  const contentsStr = fs.readFileSync(path, 'utf8');
  const contents = JSON.parse(contentsStr);
  const packages = getPackageDeclarations(contents.dependencies);
  return packages;
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

const createDir = (path: string[]): void => {
  let fullPath = nodeModulesDir;
  path.forEach(folderName => {
    fullPath += '/' + folderName;
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
  });
};

const downloadTarball = (pckg: IPackageDeclaration): Promise<boolean> => {
  const path: string[] = pckg.name.split('/');
  createDir(path);
  return new Promise((success, fail) => {
    const file = fs.createWriteStream(`${nodeModulesDir}/${pckg.name}/tarball.tgz`);
    const url = npmRegistryUrl + pckg.name + '/-/' + pckg.name + '-' + pckg.version + '.tgz';
    console.log(url);
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
  const promises = packages.map(pckg => getLatestVersionNumberOfPackage(pckg));
  const newestPackages = await Promise.all(promises);
  console.log('newestPackages', newestPackages);
  const tarballPromises = newestPackages.map(pckg => downloadTarball(pckg));
  const tarballDownloads = await Promise.all(tarballPromises);
  console.log(tarballDownloads);
};
