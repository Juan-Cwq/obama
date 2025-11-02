#!/bin/bash

# Git push script for Obama Morpher project

# Add all changes
git add .

# Commit with message (use argument or default message)
if [ -z "$1" ]; then
    git commit -m "Update Obama Morpher"
else
    git commit -m "$1"
fi

# Push to remote repository
git push origin main

echo "✅ Changes pushed to https://github.com/Juan-Cwq/obama"
