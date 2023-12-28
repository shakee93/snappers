"use strict";
exports.__esModule = true;
// src/ThankYouPage.tsx
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ThankYouPage = function () {
    return (react_1["default"].createElement("div", { className: "container p-20 text-center mt-10" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement(lucide_react_1.BadgeCheck, null),
            react_1["default"].createElement("h1", { className: "text-3xl font-bold mb-4" }, "Thank You for Your Purchase!")),
        react_1["default"].createElement("p", { className: "text-lg mb-2" }, "Your order has been successfully placed."),
        react_1["default"].createElement("div", { className: "mb-4" },
            react_1["default"].createElement("strong", null, "Order details:"),
            react_1["default"].createElement("ul", { className: "list-disc pl-4" },
                react_1["default"].createElement("li", null, "Product: Example Product"),
                react_1["default"].createElement("li", null, "Price: $19.99"),
                react_1["default"].createElement("li", null, "Order ID: 123456789"))),
        react_1["default"].createElement("p", null, "Thank you for shopping with us!")));
};
exports["default"] = ThankYouPage;
