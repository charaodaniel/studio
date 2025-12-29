
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CEOLIN Mobilidade Urbana",
    short_name: "CEOLIN",
    description: "Sua conexão para viagens tranquilas.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#2979FF",
    icons: [],
  }
}
