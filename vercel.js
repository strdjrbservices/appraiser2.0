{
  "builds"  [
    {
      "src": "api/server.py",
      "use": "@vercel/python"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes"  [
    {
      "src": "/api/(.*)",
      "dest": "api/server.py"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
