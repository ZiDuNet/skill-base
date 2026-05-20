use std::fs;
use std::path::PathBuf;

fn ensure_dir(path: &PathBuf) {
    let _ = fs::create_dir_all(path);
}

fn write_if_missing(path: &PathBuf, contents: &str) {
    if !path.exists() {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let _ = fs::write(path, contents);
    }
}

fn ensure_resource_stubs(manifest_dir: &PathBuf) {
    let resources = manifest_dir.join("resources");

    write_if_missing(
        &resources.join("bridge/placeholder.txt"),
        "# Replaced by pnpm prepare:resources before release builds.\n",
    );

    // Satisfy bundle globs during dev `cargo check` when prepare-resources has not run.
    write_if_missing(
        &resources.join("bridge/server.mjs"),
        "console.error('bridge stub — run pnpm prepare:resources'); process.exit(1);\n",
    );
    // Both paths are listed in tauri.conf.json; unused platform gets a zero-byte stub.
    write_if_missing(&resources.join("node/bin/node"), "");
    write_if_missing(&resources.join("node/node.exe"), "");
}

fn main() {
    let manifest_dir = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    ensure_resource_stubs(&manifest_dir);
    ensure_dir(&manifest_dir.join("resources/node/bin"));
    tauri_build::build();
}
