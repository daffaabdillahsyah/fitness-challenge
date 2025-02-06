const { chromium } = require("playwright");

const HEADLESS = true;
const VIDEO_DIR = ".temp/videos/";
const URL = "http://localhost:3000";
const RECORD = false;

// Generate a random username
function generateUsername() {
  const adjectives = [
    "happy",
    "silly",
    "clever",
    "funny",
    "kind",
    "brave",
    "witty",
  ];
  const nouns = ["cat", "dog", "bird", "lion", "tiger", "elephant", "monkey"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 100);
  return `${adjective}_${noun}_${randomNumber}`;
}

// Generate a random password
function generatePassword() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}

describe("Login Test", () => {
  let browser;
  let context;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: HEADLESS,
    });
    context = await browser.newContext(RECORD?{ recordVideo: { dir: VIDEO_DIR } }:{});
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  // Rest of your tests
  test("should display an error message with invalid credentials", async () => {
    await page.goto(`${URL}/login.html`); // Replace with your actual login page URL

    // Enter invalid username and password
    await page.getByLabel('Username').fill('wrongusername');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // Assert that error message is displayed
    const warningCard = await page.$("#warningCard");
    expect(warningCard).not.toBeNull();

    await page.waitForTimeout(1000);

    // Assert the text of the error message
    const warningText = await page.textContent("#warningText");
    expect(warningText).toContain("User not found");
  });

  for (let i = 0; i < 5; i++) {
    const username = generateUsername();
    const email = `${username}@c.com`;
    const password = generatePassword();

    describe(`Registration Test ${i + 1}`, () => {

      test("should register successfully with required credentials", async () => {
        await page.goto(`${URL}/register.html`); // Replace with your actual login page URL

        // Enter username and password
        await page.getByLabel('Username').fill(username);
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password', { exact: true }).fill(password);
        await page.getByLabel('Confirm Password').fill(password);

        // Submit the login form
        await Promise.all([
          page.waitForNavigation(), // Wait for navigation to complete
          page.getByRole('button', { name: 'Signup' }).click()
        ]);

        // Assert that login was successful
        const token = await page.evaluate(() => {
          return localStorage.getItem('token');
        });
    
        expect(token).not.toBeNull();
      });

      test("should log in successfully with valid credentials", async () => {
        await page.goto(`${URL}/login.html`); // Replace with your actual login page URL

        // Enter username and password
        await page.fill("#username", username);
        await page.fill("#password", password);

        // Submit the login form
        await Promise.all([
          page.waitForNavigation(), // Wait for navigation to complete
          page.click('button[type="submit"]'), // Click the submit button
        ]);

        // Assert that login was successful
        const token = await page.evaluate(() => {
          return localStorage.getItem('token');
        });
    
        expect(token).not.toBeNull();
      });
    });
  }
});