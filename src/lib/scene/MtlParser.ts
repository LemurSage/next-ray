/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A robust MTL file parser that handles various material properties
 * including problematic ones like Ke (emission)
 */
export default class MtlParser {
  private content: string;
  private materials: any[] = [];
  private currentMaterial: any = null;

  constructor(content: string) {
    this.content = content;
  }

  parse() {
    const lines = this.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      const tokens = line.split(/\s+/);
      const command = tokens[0].toLowerCase();

      switch (command) {
        case 'newmtl':
          // Start a new material
          if (this.currentMaterial) {
            this.materials.push(this.currentMaterial);
          }
          this.currentMaterial = {
            name: tokens[1],
            Kd: { method: 'rgb', red: 0.8, green: 0.8, blue: 0.8 },
            Ke: { red: 0, green: 0, blue: 0 }, // Default emission values
            Ks: { red: 0, green: 0, blue: 0 }, // Default specular
            Ns: 10, // Specular exponent
            d: 1.0, // Dissolve (opacity)
            Ni: 1.0, // Optical density (index of refraction)
            illum: 2, // Illumination model
          };
          break;

        case 'kd': // Diffuse color
          if (this.currentMaterial) {
            this.currentMaterial.Kd = {
              method: 'rgb',
              red: parseFloat(tokens[1]),
              green: parseFloat(tokens[2]),
              blue: parseFloat(tokens[3]),
            };
          }
          break;

        case 'ke': // Emission color
          if (this.currentMaterial) {
            this.currentMaterial.Ke = {
              red: parseFloat(tokens[1]),
              green: parseFloat(tokens[2]),
              blue: parseFloat(tokens[3]),
            };
          }
          break;

        case 'ks': // Specular color
          if (this.currentMaterial) {
            this.currentMaterial.Ks = {
              red: parseFloat(tokens[1]),
              green: parseFloat(tokens[2]),
              blue: parseFloat(tokens[3]),
            };
          }
          break;

        case 'ns': // Specular exponent
          if (this.currentMaterial) {
            this.currentMaterial.Ns = parseFloat(tokens[1]);
          }
          break;

        case 'd': // Dissolve (opacity)
          if (this.currentMaterial) {
            this.currentMaterial.d = parseFloat(tokens[1]);
          }
          break;

        case 'ni': // Index of refraction
          if (this.currentMaterial) {
            this.currentMaterial.Ni = parseFloat(tokens[1]);
          }
          break;

        case 'illum': // Illumination model
          if (this.currentMaterial) {
            this.currentMaterial.illum = parseInt(tokens[1]);
          }
          break;

        // Handle texture maps
        case 'map_kd':
        case 'map_ks':
        case 'map_bump':
        case 'bump':
        case 'map_d':
        case 'refl':
          // Store texture paths but don't process them now
          if (this.currentMaterial) {
            this.currentMaterial[command] = tokens.slice(1).join(' ');
          }
          break;

        default:
          // Handle unknown statements - silently ignore or log
          console.log(`Ignoring unknown MTL statement: ${command}`);
      }
    }

    // Add the last material if exists
    if (this.currentMaterial) {
      this.materials.push(this.currentMaterial);
    }

    return this.materials;
  }
}
