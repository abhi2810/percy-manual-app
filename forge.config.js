module.exports = {
  packagerConfig: {
    extraResource: ["./src/binary"],
    icon: "src/assets/percy",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {
        format: "ULFO",
      },
    },
    {
      name: "@electron-forge/maker-zip",
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [],
};
