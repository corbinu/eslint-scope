// -*- coding: utf-8 -*-
//  Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//    * Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
//  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
//  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
//  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
//  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
"use strict";

const Tracer = require("./util/traverser-tracer");
const checkTrace = require("./util/traverser-check-trace");
const espree = require("./util/espree");

function classDeclaration() {
    const program = espree(`
        class Hello {
        };
    `);

    return program.body[0];
}

describe("rest expression", () => {
    it("argument", () => {
        const tree = {
            type: "RestElement",
            argument: {
                type: "Identifier",
                name: "hello"
            }
        };

        checkTrace(Tracer.dump(tree), `
            enter - RestElement
            enter - Identifier
            leave - Identifier
            leave - RestElement
        `);
    });
});

describe("class", () => {
    it("declaration#1", () => {
        const tree = espree(`
            class Hello extends World {
                method() {
                }
            };
        `);

        checkTrace(Tracer.dump(tree), `
            enter - Program
            enter - ClassDeclaration
            enter - Identifier
            leave - Identifier
            enter - Identifier
            leave - Identifier
            enter - ClassBody
            enter - MethodDefinition
            enter - Identifier
            leave - Identifier
            enter - FunctionExpression
            enter - BlockStatement
            leave - BlockStatement
            leave - FunctionExpression
            leave - MethodDefinition
            leave - ClassBody
            leave - ClassDeclaration
            enter - EmptyStatement
            leave - EmptyStatement
            leave - Program
        `);
    });

    it("declaration#2", () => {
        const tree = espree(`
            class Hello extends ok() {
                method() {
                }
            };
        `);

        checkTrace(Tracer.dump(tree), `
            enter - Program
            enter - ClassDeclaration
            enter - Identifier
            leave - Identifier
            enter - CallExpression
            enter - Identifier
            leave - Identifier
            leave - CallExpression
            enter - ClassBody
            enter - MethodDefinition
            enter - Identifier
            leave - Identifier
            enter - FunctionExpression
            enter - BlockStatement
            leave - BlockStatement
            leave - FunctionExpression
            leave - MethodDefinition
            leave - ClassBody
            leave - ClassDeclaration
            enter - EmptyStatement
            leave - EmptyStatement
            leave - Program
        `);
    });
});

describe("export", () => {
    it("named declaration #1", () => {
        const tree = {
            type: "ExportNamedDeclaration",
            declaration: {
                type: "VariableDeclaration",
                declarations: [{
                    type: "VariableDeclarator",
                    id: {
                        type: "Identifier",
                        name: "hello"
                    },
                    init: {
                        type: "Literal",
                        value: 6
                    }
                }]
            }
        };

        checkTrace(Tracer.dump(tree), `
            enter - ExportNamedDeclaration
            enter - VariableDeclaration
            enter - VariableDeclarator
            enter - Identifier
            leave - Identifier
            enter - Literal
            leave - Literal
            leave - VariableDeclarator
            leave - VariableDeclaration
            leave - ExportNamedDeclaration
        `);
    });

    it("named declaration #2", () => {
        const tree = {
            type: "ExportNamedDeclaration",
            declaration: null,
            specifiers: [{
                type: "ExportSpecifier",
                exported: {
                    type: "Identifier",
                    name: "foo"
                },
                local: {
                    type: "Identifier",
                    name: "bar"
                }

            }],
            source: {
                type: "Literal",
                value: "hello"
            }
        };

        checkTrace(Tracer.dump(tree), `
            enter - ExportNamedDeclaration
            enter - ExportSpecifier
            enter - Identifier
            leave - Identifier
            enter - Identifier
            leave - Identifier
            leave - ExportSpecifier
            enter - Literal
            leave - Literal
            leave - ExportNamedDeclaration
        `);
    });

    it("all declaration #1", () => {
        const tree = {
            type: "ExportAllDeclaration",
            source: {
                type: "Literal",
                value: "hello"
            }
        };

        checkTrace(Tracer.dump(tree), `
            enter - ExportAllDeclaration
            enter - Literal
            leave - Literal
            leave - ExportAllDeclaration
        `);
    });

    it("default declaration #1", () => {
        const tree = {
            type: "ExportDefaultDeclaration",
            declaration: classDeclaration()
        };

        checkTrace(Tracer.dump(tree), `
            enter - ExportDefaultDeclaration
            enter - ClassDeclaration
            enter - Identifier
            leave - Identifier
            enter - ClassBody
            leave - ClassBody
            leave - ClassDeclaration
            leave - ExportDefaultDeclaration
        `);
    });

    it("default declaration #1", () => {
        const tree = {
            type: "ExportDefaultDeclaration",
            declaration: classDeclaration()
        };

        checkTrace(Tracer.dump(tree), `
            enter - ExportDefaultDeclaration
            enter - ClassDeclaration
            enter - Identifier
            leave - Identifier
            enter - ClassBody
            leave - ClassBody
            leave - ClassDeclaration
            leave - ExportDefaultDeclaration
        `);
    });
});

describe("import", () => {
    it("default specifier #1", () => {
        const tree = espree("import Cocoa from \"rabbit-house\"");

        checkTrace(Tracer.dump(tree), `
            enter - Program
            enter - ImportDeclaration
            enter - ImportDefaultSpecifier
            enter - Identifier
            leave - Identifier
            leave - ImportDefaultSpecifier
            enter - Literal
            leave - Literal
            leave - ImportDeclaration
            leave - Program
        `);
    });

    it("named specifier #1", () => {
        const tree = espree("import {Cocoa, Cappuccino as Chino} from \"rabbit-house\"");

        checkTrace(Tracer.dump(tree), `
            enter - Program
            enter - ImportDeclaration
            enter - ImportSpecifier
            enter - Identifier
            leave - Identifier
            enter - Identifier
            leave - Identifier
            leave - ImportSpecifier
            enter - ImportSpecifier
            enter - Identifier
            leave - Identifier
            enter - Identifier
            leave - Identifier
            leave - ImportSpecifier
            enter - Literal
            leave - Literal
            leave - ImportDeclaration
            leave - Program
        `);
    });

    it("namespace specifier #1", () => {
        const tree = espree("import * as RabbitHouse from \"rabbit-house\"");

        checkTrace(Tracer.dump(tree), `
            enter - Program
            enter - ImportDeclaration
            enter - ImportNamespaceSpecifier
            enter - Identifier
            leave - Identifier
            leave - ImportNamespaceSpecifier
            enter - Literal
            leave - Literal
            leave - ImportDeclaration
            leave - Program
        `);
    });
});

describe("pattern", () => {
    it("assignment pattern#1", () => {
        const tree = {
            type: "AssignmentPattern",
            left: {
                type: "Identifier",
                name: "hello"
            },
            right: {
                type: "Literal",
                value: "world"
            }
        };

        checkTrace(Tracer.dump(tree), `
            enter - AssignmentPattern
            enter - Identifier
            leave - Identifier
            enter - Literal
            leave - Literal
            leave - AssignmentPattern
        `);
    });
});

describe("super", () => {
    it("super expression#1", () => {
        const tree = { type: "Super" };

        checkTrace(Tracer.dump(tree), `
            enter - Super
            leave - Super
        `);
    });
});

describe("meta property", () => {
    it("MetaProperty in constructor #1", () => {
        const tree = {
            type: "UnaryExpression",
            operator: "typeof",
            prefix: true,
            argument: {
                type: "MetaProperty",
                meta: {
                    type: "Identifier",
                    name: "new"
                },
                property: {
                    type: "Identifier",
                    name: "target"
                }
            }
        };

        checkTrace(Tracer.dump(tree), `
            enter - UnaryExpression
            enter - MetaProperty
            enter - Identifier
            leave - Identifier
            enter - Identifier
            leave - Identifier
            leave - MetaProperty
            leave - UnaryExpression
        `);
    });
});

// vim: set sw=4 ts=4 et tw=80 :
