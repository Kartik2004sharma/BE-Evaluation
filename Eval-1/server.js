const http = require("http");
const fs = require("fs");
const path = require("path");
const qs = require("querystring");

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (!fs.existsSync("User.json")) {
        fs.writeFileSync("User.json", "[]");
    }

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "GET") {
        if (req.url.startsWith("/assets/")) {
            const filePath = path.join(__dirname, req.url);
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = {
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".gif": "image/gif",
                ".ico": "image/x-icon",
            }[ext];
        
            if (mimeType) {
                try {
                    const data = fs.readFileSync(filePath);
                    res.writeHead(200, { "Content-Type": mimeType });
                    res.end(data);
                } catch (error) {
                    console.error(`Error reading ${filePath}:`, error);
                    res.writeHead(404);
                    res.end("File not found");
                }
            } else {
                res.writeHead(415);
                res.end("Unsupported Media Type");
            }
            return;
        }
        
        switch(req.url) {
            case "/":
                sendFile(res,"index.html","text/html");
                break;
            case "/form":
                sendFile(res, "jobapplication.html", "text/html");
                break;
            case "/admin":
                sendFile(res, "admin.html", "text/html");
                break;
            case "/student":
                sendFile(res, "student.html", "text/html");
                break;
            case "/users":
                sendFile(res, "User.json", "application/json");
                break;
            default:
                res.writeHead(404);
                res.end("Not Found");
        }
    } else if (req.method === "POST" && req.url === "/form") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                const formData = qs.parse(body);
                const users = JSON.parse(fs.readFileSync("User.json", "utf8"));
                users.push(formData);
                fs.writeFileSync("User.json", JSON.stringify(users, null, 2));
                res.writeHead(200, { "Content-Type": "text/plain" });
                // res.writeHead(302, { 'Location': '/student' });
                res.end("Application Submitted Successfully!");
            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500);
                res.end("Error processing form");
            }
        });
    }
});

function sendFile(res, filename, contentType) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        res.writeHead(500);
        res.end("Server Error");
    }
}

server.listen(3000, () => console.log("Server running on port 3000"));