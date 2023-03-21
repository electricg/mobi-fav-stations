#!/bin/sh

# Automatically change the version patch on commit
# Put this in `.git/hooks/pre-commit` as `pre-commit` without extention

script1="js/settings.js"
script2="sw.js"

npm version patch --no-git-tag-version

replace=`node -p "require('./package.json').version"`

# "const VERSION = '123.456.789';"
search="(const VERSION *= *[\'\"])([0-9.]+)([\'\"];*)"

# if you change the order of the flags, you have to change the name of the backup file to delete
sed -i -n -E -e "s/$search/\1$replace\3/" $script1
sed -i -n -E -e "s/$search/\1$replace\3/" $script2

# because the stupid sed in Mac creates a backup file
rm -f $script1-n
rm -f $script2-n

git add package.json package-lock.json $script1 $script2