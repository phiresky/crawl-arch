#!/bin/bash
set -e 
mirror="https://mirrors.kernel.org/archlinux"
out="data/packages"
mkdir -p $out
for f in core extra community multilib; do
	fname=$f.db.tar.gz
	curl "$mirror/$f/os/x86_64/$fname" -o data/$fname
	tar xf data/$fname -C $out
	rm data/$fname
done

# aur
(
	cd data
	[ -d 'aur-mirror' ] || git clone --depth=1 git://pkgbuild.com/aur-mirror.git
	cd aur-mirror

	function runmksrc() {
		[ -f "$1/.SRCINFO" ] || mksrcinfo -o "$1/.SRCINFO" "$1/PKGBUILD"
	}

	export -f runmksrc

	parallel -j8 --bar runmksrc ::: *
)
