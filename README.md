# hikka-lastfm

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.js
```

To docker deploy:

```bash
docker build -t hikkalastfm .
docker run -d --restart=always --name hikkalastfm hikkalastfm
```

Don't forget to set up your `.env` with `example.env`.