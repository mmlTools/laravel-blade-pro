import { describe, expect, it } from "vitest";
import { tokenizeBlade } from "../../src/blade/tokenizer.js";
import { parseDirectiveBlocks } from "../../src/blade/parser.js";
import { DirectiveRegistry } from "../../src/blade/directives.js";

describe("parseDirectiveBlocks", () => {
  it("builds a nested directive tree", () => {
    const blocks = parseDirectiveBlocks(tokenizeBlade("@section('x') @if($x) @foreach($xs as $x) @endforeach @endif @endsection"), new DirectiveRegistry());
    expect(blocks[0]?.name).toBe("section"); expect(blocks[0]?.children[0]?.name).toBe("if"); expect(blocks[0]?.children[0]?.children[0]?.name).toBe("foreach");
  });
});
