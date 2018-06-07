import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';

import { IPackageDeclaration } from './types';

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
      // console.log(params);
      console.log('got the data');
    })
  );
};

export const downloadPackages = async (packages: IPackageDeclaration[]) => {
  // download the package info for each package name e.g. http://registry.npmjs.org/mobx
  const npmRegistryUrl = 'http://registry.npmjs.org/';
  const res = await axios.get('https://registry.npmjs.org/typescript');
  console.log(res.status);
  // const urls = packages.map(p => npmRegistryUrl + p.name);
  // fetchTarballUrls(urls);
  // packages.forEach(async (pckg: IPackageDeclaration) => {
  //   const pckgData = await axios.get(npmRegistryUrl + pckg.name);
  //   const latestVersion: string = pckgData.data['dist-tags'].latest;
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
