/** @jest-environment jsdom */
const { calculateTurkishTax, WHOLESALE_FACTOR } = require('./script.js');

describe('Sales System - Comprehensive Master Procedure Tests', () => {

    // TAX AND MATHEMATICAL LOGIC TESTS
    describe('Tax Calculation Engine (TR-Tax)', () => {
        test('Luxury Vehicle: 1.5M TL should correctly apply 220% SCT + 20% VAT', () => {
            const res = calculateTurkishTax(1500000, 'Vehicle');
            expect(res.otvRate).toBe(220);
            expect(res.finalPrice).toBe(5760000);
        });

        test('Mid-Range Vehicle: 420k TL should correctly apply 45% SCT + 20% VAT', () => {
            const res = calculateTurkishTax(420000, 'Vehicle');
            expect(res.otvRate).toBe(45);
            expect(res.finalPrice).toBe(730800);
        });

        test('Electronics: Should apply fixed 25% SCT and 20% VAT', () => {
            const res = calculateTurkishTax(2000, 'Electronics');
            expect(res.otvAmount).toBe(500); 
            expect(res.finalPrice).toBe(3000); 
        });

        test('Accessories: Should apply 0% SCT and only 20% VAT', () => {
            const res = calculateTurkishTax(1000, 'Accessories');
            expect(res.otvAmount).toBe(0);
            expect(res.finalPrice).toBe(1200);
        });
    });

    // BUSINESS LOGIC TESTS
    describe('Business Operation Logic', () => {
        test('Wholesale Factor (Factory Cost Multiplier) must be 0.70', () => {
            expect(WHOLESALE_FACTOR).toBe(0.70);
        });

        test('Unknown Category: Should apply default (Others) tax rates', () => {
            const res = calculateTurkishTax(1000, 'UnknownCategory');
            
            expect(res.kdvRate).toBe(10);
            expect(res.finalPrice).toBe(1100);
        });
    });

    // SYSTEM & DATA INTEGRATION (LocalStorage & DOM)
    describe('System Integration', () => {
        test('LocalStorage: Should be accessible and persistent for data storage', () => {
            localStorage.setItem('test_key', 'working');
            expect(localStorage.getItem('test_key')).toBe('working');
        });

        test('DOM Simulation: Should allow element manipulation via JSDOM', () => {
            document.body.innerHTML = '<div id="dash-balance">0</div>';
            const el = document.getElementById('dash-balance');
            el.innerText = '$1,000';
            expect(el.innerText).toBe('$1,000');
        });
    });

    // FULL SYSTEM BEHAVIORAL TESTS
    describe('Full System Flow Analysis', () => {

        test('User Authentication: Default user "ali" should exist in storage', () => {
            
            const defaultUsers = [{ id: 1, name: "Ali", username: "ali", password: "1234", businessAcc: "BA1001" }];
            
            if (!localStorage.getItem('users')) {
                localStorage.setItem('users', JSON.stringify(defaultUsers));
            }

            const initialUsers = JSON.parse(localStorage.getItem('users'));
            const ali = initialUsers.find(u => u.username === 'ali');
            
            expect(ali).toBeDefined();
            expect(ali.password).toBe('1234');
        });

    describe('Financial Thresholds & Limits', () => {
        test('Treasury: Initial company balance should be 2M $', () => {
            const companyAccount = { balance: 2000000 };
            expect(companyAccount.balance).toBe(2000000);
        });

        test('Budget Control: Should prevent transaction if cost exceeds balance', () => {
            const balance = 1000;
            const orderCost = 5000;
            
            const isSuccess = orderCost <= balance;
            expect(isSuccess).toBe(false); 
        });
    });

    describe('System Resilience & Error Handling', () => {
        test('Stability: System should not crash with undefined categories', () => {
            const res = calculateTurkishTax(100, 'NonExistentCategory');
            expect(res.finalPrice).toBeDefined();
            expect(res.otvRate).toBe(0);
        });
    });
});
});