/* eslint-disable @typescript-eslint/no-unsafe-call */

import users from '../fixtures/users.json';
import { happenings } from '../fixtures/happening.json';

const checkSubmitRegistration = (degree: string, degreeYear: number) => {
    cy.get('[data-cy=reg-btn]').click();
    cy.get('[data-cy=reg-form]').should('be.visible');

    cy.get('input[name=email]').type(`${degree}${degreeYear}@test.com`);
    cy.get('input[name=firstName]').type('Test');
    cy.get('input[name=lastName]').type('McTest');
    cy.get('select[name=degree]').select(degree);
    cy.get('input[name=degreeYear]').check(degreeYear.toString(), { force: true });
    cy.get('input[id=terms1]').check({ force: true });
    cy.get('input[id=terms2]').check({ force: true });
    cy.get('input[id=terms3]').check({ force: true });

    cy.get('button[type=submit]').click();

    cy.get('li[class=chakra-toast]').contains('Påmeldingen din er registrert!');
};

describe('Happening registration', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        for (const { slug, type } of happenings) {
            context('Bedpres form registration', () => {
                beforeEach(() => {
                    cy.visit(`/${type.toLowerCase()}/${slug}`);
                });

                it('Popup form appears correctly', () => {
                    cy.get('[data-cy=reg-btn]').click();
                    cy.get('[data-cy=reg-form]').should('be.visible');

                    cy.get('input[name=email]').should('be.visible');
                    cy.get('input[name=firstName]').should('be.visible');
                    cy.get('input[name=lastName]').should('be.visible');
                    cy.get('select[name=degree]').should('be.visible');

                    /*

                    TODO: fix this.

                    Chakra hides radio and checkbox input beneath another element,
                    therefore it will never be visible.

                    cy.get('input[name=degreeYear]').should('be.visible');
                    cy.get('input[id=terms1]').should('be.visible');
                    cy.get('input[id=terms2]').should('be.visible');
                    cy.get('input[id=terms3]').should('be.visible');

                   */
                });

                for (const b of users.bachelorDegrees) {
                    for (const y of [1, 2, 3]) {
                        it(`User can sign up with valid input (degree = ${b}, degreeYear = ${y}, type = ${type})`, () => {
                            checkSubmitRegistration(b, y);
                        });
                    }
                }

                for (const m of users.masterDegrees) {
                    for (const y of [4, 5]) {
                        it(`User can sign up with valid input (degree = ${m}, degreeYear = ${y}, type = ${type})`, () => {
                            checkSubmitRegistration(m, y);
                        });
                    }
                }

                it(`User can sign up with valid input (degree = ${users.validKogniUser.degree}, degreeYear = ${users.validKogniUser.degreeYear}, type = ${type})`, () => {
                    checkSubmitRegistration(users.validKogniUser.degree, users.validKogniUser.degreeYear);
                });

                it(`User can sign up with valid input (degree = ${users.validArmninfUser.degree}, degreeYear = ${users.validArmninfUser.degreeYear}, type = ${type})`, () => {
                    checkSubmitRegistration(users.validArmninfUser.degree, users.validArmninfUser.degreeYear);
                });
            });
        }
    });
});
