import axios from 'axios';

interface PackageDeclaration {
  name: string,
  version: string,
}

const parsePackageJson = (): PackageDeclaration[] => {
  return [
    {
      name: 'test',
      version: '123'
    }
  ];
}

const downloadPackages = async function (packages: PackageDeclaration[]) {
  const result = await axios.get('https://google.com', {});
  console.log(result.data);
}

const packages = parsePackageJson();
downloadPackages(packages);

console.log('the app is running');

