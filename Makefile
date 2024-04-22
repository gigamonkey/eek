all: public/index.html

public/index.html: questions.yml
	node generate.js
	prettier -w $@
