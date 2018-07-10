/**
 * @fileoverview
 * @suppress {extraRequire}  
 * @license
 * Copyright 2018 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {DEBUG} from './global';
import {NameOrCtorDef} from './types';


/**
 * Keeps track whether or not we are in an attributes declaration (after
 * elementOpenStart, but before elementOpenEnd).
 */
let inAttributes = false;


/**
 * Keeps track whether or not we are in an element that should not have its
 * children cleared.
 */
let inSkip = false;

/**
 * Makes sure that a key is not set in an argsbuilder.
 */
function assertKeyNotSet(argsBuilder: Array<{}|null|undefined>) {
  if (argsBuilder[1]) {
    throw new Error(`Cannot redefine key in ${argsBuilder[0]}`);
  }
}


/**
 * Makes sure that there is a current patch context.
 */
function assertInPatch(functionName: string, context: Document) {
  if (!context) {
    throw new Error('Cannot call ' + functionName + '() unless in patch.');
  }
}


/**
 * Makes sure that a patch closes every node that it opened.
 * @param openElement
 * @param root
 */
function assertNoUnclosedTags(
    openElement: Node|null, root: Node|DocumentFragment) {
  if (openElement === root) {
    return;
  }

  let currentElement = openElement;
  const openTags: Array<string> = [];
  while (currentElement && currentElement !== root) {
    openTags.push(currentElement.nodeName.toLowerCase());
    currentElement = currentElement.parentNode;
  }

  throw new Error('One or more tags were not closed:\n' + openTags.join('\n'));
}


/**
 * Makes sure that node being outer patched has a parent node.
 */
function assertPatchOuterHasParentNode(parent: Node|null) {
  if (!parent) {
    console.warn(
      'patchOuter requires the node have a parent if there is a key.');
  }
}


/**
 * Makes sure that the caller is not where attributes are expected.
 */
function assertNotInAttributes(functionName: string) {
  if (inAttributes) {
    throw new Error(
        functionName + '() can not be called between ' +
        'elementOpenStart() and elementOpenEnd().');
  }
}


/**
 * Makes sure that the caller is not inside an element that has declared skip.
 */
function assertNotInSkip(functionName: string) {
  if (inSkip) {
    throw new Error(
        functionName + '() may not be called inside an element ' +
        'that has called skip().');
  }
}


/**
 * Makes sure that the caller is where attributes are expected.
 */
function assertInAttributes(functionName: string) {
  if (!inAttributes) {
    throw new Error(
        functionName + '() can only be called after calling ' +
        'elementOpenStart().');
  }
}


/**
 * Makes sure the patch closes virtual attributes call
 */
function assertVirtualAttributesClosed() {
  if (inAttributes) {
    throw new Error(
        'elementOpenEnd() must be called after calling ' +
        'elementOpenStart().');
  }
}


/**
 * Makes sure that tags are correctly nested.
 */
function assertCloseMatchesOpenTag(
    currentNameOrCtor: NameOrCtorDef, nameOrCtor: NameOrCtorDef) {
  if (currentNameOrCtor !== nameOrCtor) {
    throw new Error(
        'Received a call to close "' + nameOrCtor + '" but "' +
        currentNameOrCtor + '" was open.');
  }
}


/**
 * Makes sure that no children elements have been declared yet in the current
 * element.
 */
function assertNoChildrenDeclaredYet(
    functionName: string, previousNode: Node|null) {
  if (previousNode !== null) {
    throw new Error(
        functionName + '() must come before any child ' +
        'declarations inside the current element.');
  }
}


/**
 * Checks that a call to patchOuter actually patched the element.
 * @param maybeStartNode The value for the currentNode when the patch
 *     started.
 * @param currentNode The currentNode when the patch finished.
 * @param expectedNextNode The Node that is expected to follow the
 *    currentNode after the patch;
 * @param  expectedPrevNode The Node that is expected to preceed the
 *    currentNode after the patch.
 */
function assertPatchElementNoExtras(
    maybeStartNode: Node|null, maybeCurrentNode: Node|null,
    expectedNextNode: Node|null, expectedPrevNode: Node|null) {
  assert(maybeStartNode);
  const startNode = maybeStartNode!;
  // tslint:disable-next-line:no-unnecessary-type-assertion
  const currentNode = maybeCurrentNode!;
  const wasUpdated = currentNode.nextSibling === expectedNextNode &&
      currentNode.previousSibling === expectedPrevNode;
  const wasChanged = currentNode.nextSibling === startNode.nextSibling &&
      currentNode.previousSibling === expectedPrevNode;
  const wasRemoved = currentNode === startNode;

  if (!wasUpdated && !wasChanged && !wasRemoved) {
    throw new Error(
        'There must be exactly one top level call corresponding ' +
        'to the patched element.');
  }
}


/**
 * Updates the state of being in an attribute declaration.
 * @return the previous value.
 */
function setInAttributes(value: boolean) {
  const previous = inAttributes;
  inAttributes = value;
  return previous;
}


/**
 * Updates the state of being in a skip element.
 * @return the previous value.
 */
function setInSkip(value: boolean) {
  const previous = inSkip;
  inSkip = value;
  return previous;
}

/**
 * Asserts that a value exists and is not null or undefined. goog.asserts
 * is not used in order to avoid dependencies on external code.
 */
function assert<T extends {}>(val: T|null|undefined): T {
  if (DEBUG && !val) {
    throw new Error('Expected value to be defined');
  }
  return val!;
}


export {
  assert,
  assertKeyNotSet,
  assertInPatch,
  assertNoUnclosedTags,
  assertNotInAttributes,
  assertInAttributes,
  assertCloseMatchesOpenTag,
  assertVirtualAttributesClosed,
  assertNoChildrenDeclaredYet,
  assertNotInSkip,
  assertPatchElementNoExtras,
  assertPatchOuterHasParentNode,
  setInAttributes,
  setInSkip,
};