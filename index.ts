import { downloadPackages, findPackageJson, parsePackageJson } from './utils';

console.log('the app is running');
function a() {}
const path = findPackageJson();
const packages = parsePackageJson(path);
downloadPackages(packages);
