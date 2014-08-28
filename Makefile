install-modules:
	for i in `ls -d lips-modules/*-lips`; do cd $$i; npm install; cd -; done;
