const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "EMSYS Club Website API",
            version: "1.0.0",
            description: "동아리 웹사이트 백엔드 API 문서",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local server",
            },
        ],
    },

    // Swagger 주석을 읽을 파일 위치
    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;