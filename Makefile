all: public/index.html

public/index.html: questions.yml
	node generate.js
	prettier -w $@

publish:
	rsync -r public/ ~/hacks/bhs-cs-classes/eek/

diff:
	diff -qr public/ ~/hacks/bhs-cs-classes/eek/
