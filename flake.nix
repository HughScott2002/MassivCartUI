{
  description = "MassivCartUI dev shell — bun + node 22";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

  outputs = { self, nixpkgs }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              bun
              nodejs_22
            ];

            shellHook = ''
              if [ ! -d node_modules ]; then
                echo "node_modules missing — running bun install"
                bun install
              fi
              if [ ! -f .env ] && [ ! -f .env.local ]; then
                echo "WARNING: no .env or .env.local — copy .env.example and fill in values"
              fi
            '';
          };
        });
    };
}
