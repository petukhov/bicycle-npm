import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';

import { PackageDeclaration } from './types';

export const findPackageJson = (): string => {
  // TODO: search for the package in current directory
  return 'package.json';
}

export const getPackageDeclarations = (depsStr: {[pckgName: string]: string}): PackageDeclaration[] => {
  return _(depsStr)
          .toPairs()
          .map(pair => ({name: pair[0], version: pair[1]}))
          .value();
}

export const parsePackageJson = (path: string): PackageDeclaration[] => {
  const contentsStr = fs.readFileSync(path, 'utf8');
  const contents = JSON.parse(contentsStr);
  const packages = getPackageDeclarations(contents.dependencies);
  console.log(packages);
  return packages;
}

export const downloadPackages = async function (packages: PackageDeclaration[]) {
  //const result = await axios.get('https://google.com', {});
  //console.log(result.data);
}