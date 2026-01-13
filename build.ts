await Bun.build({
    entrypoints: ["./src/server.ts"],
    outdir: "./dist",
    target: "bun",
    minify: {
        whitespace: true,
        syntax: true
    },
    compile: {
        target: "bun-linux-arm64",
        outfile: "server"
    }
})

export {}