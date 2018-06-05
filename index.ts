import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';

interface PackageDeclaration {
  name: string,
  version: string,
}

const findPackageJson = (): string => {
  // TODO: search for the package in current directory
  return 'package.json';
}

const getPackageDeclarations = (depsStr: {[pckgName: string]: string}): PackageDeclaration[] => {
  return _(depsStr)
          .toPairs()
          .map(pair => ({name: pair[0], version: pair[1]}))
          .value();
}

const parsePackageJson = (path: string): PackageDeclaration[] => {
  const contentsStr = fs.readFileSync(path, 'utf8');
  const contents = JSON.parse(contentsStr);
  const packages = getPackageDeclarations(contents.dependencies);
  return packages;
}

const downloadPackages = async function (packages: PackageDeclaration[]) {
  //const result = await axios.get('https://google.com', {});
  //console.log(result.data);
}

const path = findPackageJson();
const packages = parsePackageJson(path);
downloadPackages(packages);


