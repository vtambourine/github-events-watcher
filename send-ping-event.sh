#!/usr/bin/env bash

curl -X POST \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -H "X-GitHub-Delivery: 19ab4000-bac3-11e4-9d53-8285430ec4a6" \
    -H "X-Hub-Signature: sha1=62e3dbd84e8440812d752a3d4771e813b93089ba" \
    --data "`cat ping-event.txt`" \
    $1
