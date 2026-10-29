SHELL := /bin/bash
ID ?= 001-silence

.PHONY: assets tts props preview video qc clean

assets:
	node scripts/sfx-gen.mjs
	node scripts/fetch-broll.mjs --id $(ID)

tts:
	node scripts/tts.mjs --id $(ID)

props:
	node scripts/build-props.mjs --id $(ID)

preview:
	node scripts/pipeline.mjs --id $(ID) --scale 0.5

video:
	node scripts/pipeline.mjs --id $(ID) --scale 1

qc:
	node scripts/qc.mjs --file out/$(ID).mp4

clean:
	rm -rf out content/$(ID)/build public/content
