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
