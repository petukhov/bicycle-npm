import { findPackageJson, parsePackageJson, downloadPackages } from './utils';

console.log('the app is running');
const path = findPackageJson();
const packages = parsePackageJson(path);
downloadPackages(packages);