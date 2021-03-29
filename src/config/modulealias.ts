import ModuleAliases from 'module-alias';
import jspath from 'path';

ModuleAliases.addAliases({
    '@system': jspath.join(__dirname, '../api/system'),
    '@database': jspath.join(__dirname, '/database'),
});

ModuleAliases();
