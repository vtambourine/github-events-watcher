#!/usr/bin/env bash

curl -X POST \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: push" \
    -H "X-GitHub-Delivery: 19ab4000-bac3-11e4-9d53-8285430ec4a6" \
    -H "X-Hub-Signature: sha1=a6912978e77b02f24bcee5e1c5df33da0f5620fb" \
    --data "`cat push-event.txt`" \
    $1
