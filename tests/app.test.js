const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('AntiGravity Arena - AppLogic Unit Tests', () => {
    let AppLogic;

    beforeAll(() => {
        // Setup JSDOM to mimic browser environment and load app.js
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        const js = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');

        const dom = new JSDOM(html, { runScripts: "dangerously" });
        const scriptEl = dom.window.document.createElement("script");
        scriptEl.textContent = js;
        dom.window.document.body.appendChild(scriptEl);

        AppLogic = dom.window.AppLogic;
    });

    test('calculateCapacityChange safely bounds between 0 and 100', () => {
        expect(AppLogic.calculateCapacityChange(90, 20)).toBe(100);
        expect(AppLogic.calculateCapacityChange(10, -20)).toBe(0);
        expect(AppLogic.calculateCapacityChange(50, 10)).toBe(60);
    });

    test('determineDensity correctly assigns status strings', () => {
        expect(AppLogic.determineDensity(95)).toBe('critical');
        expect(AppLogic.determineDensity(80)).toBe('high');
        expect(AppLogic.determineDensity(50)).toBe('normal');
        expect(AppLogic.determineDensity(30)).toBe('low');
    });

    test('sanitizeInput strips dangerous characters to prevent XSS', () => {
        const maliciousInput = "<script>alert('hack')</script> Seat 10";
        const cleanInput = AppLogic.sanitizeInput(maliciousInput);
        expect(cleanInput).not.toContain("<script>");
        expect(cleanInput).toBe('scriptalerthackscript Seat 10');
    });
});
