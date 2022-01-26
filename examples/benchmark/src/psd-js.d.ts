// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

// As of 2022-01-17, PSD.js does not provide its own type definitions, and does
// not have an entry in the DefinitelyTyped project.
// As such, we provide our own types.
//
// Note: These types are based on the browser build, not the Node.js build!

export = PSD;

declare class PSD {
  parsed: boolean;
  header: any | null;
  resources?: any;
  layerMask: PSD.LayerMask;
  image: PSD.Image;

  /**
   * Creates a new PSD object. Typically you will use a helper method to
   * instantiate the PSD object. However, if you already have the PSD data
   * stored as a `Uint8Array`, you can instantiate the PSD object directly.
   */
  constructor(data: Uint8Array);

  /**
   * Parses the PSD. You must call this method before attempting to access PSD
   * data. It will not re-parse the PSD if it has already been parsed.
   */
  parse(): void;

  /**
   * Returns a tree representation of the PSD document, which is the preferred
   * way of accessing most of the PSD's data.
   */
  tree(): PSD.Node.Root;

  // From shims/init.coffee
  static fromURL(file: string): Promise<PSD>;
  static fromEvent(e: InputEvent): Promise<PSD>;
  static fromDroppedFile(file: Blob): Promise<PSD>;
}

declare namespace PSD {
  // lib/psd/channel_image.coffee
  /**
   * Represents an image for a single layer, which differs slightly in format
   * from the full size preview image.
   *
   * The full preview at the end of the PSD document has the same compression
   * for all channels, whereas layer images define the compression per color
   * channel. The dimensions can also differ per channel if we're parsing mask
   * data (channel ID < -1).
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ChannelImage extends Image {
    // TODO: Finish this
  }

  type ChildrenExport = Node.GroupExport | Node.LayerExport;

  // lib/psd/image.coffee
  /**
   * Represents the full preview image at the end of the PSD document. For this
   * image, the compression is defined for all channels, and there is no mask
   * data. The width and height are derived from the PSD header, which is the
   * full size of the PSD document.
   */
  interface Image {
    // TODO: Finish this

    // Mixins from lib/psd/image_exports/png.coffee
    // (shimmed with shims/png.coffee)
    toBase64(): string;
    toPng(): HTMLImageElement;

    /**
     * The resulting array that stores the pixel data, formatted in RGBA format.
     */
    pixelData: Uint8Array;

    width(): number;
    height(): number;
  }

  // lib/psd/layer.coffee
  // (not to be confused with PSD.Node.Layer)
  /**
   * Represents a single layer and all of the data associated with that layer.
   * Typically you will access this data from a {@link Node} object, which simplifies
   * access for you.
   */
  interface Layer {
    // Mixin from lib/psd/layer/position_channels.coffee
    top: number;
    left: number;
    bottom: number;
    right: number;
    channels: number;

    rows: number;
    height: number;
    cols: number;
    width: number;

    /**
     * Every color channel has both an ID and a length. The ID correlates to the
     * color channel, e.g. 0 = R, 1 = G, 2 = B, -1 = A, and the length is the
     * size of the data.
     */
    channelsInfo: {id: number; length: number}[];

    // Mixin from lib/psd/layer/blend_modes.coffee
    blendMode: BlendMode;

    opacity: BlendMode["opacity"];
    visible: BlendMode["visible"];
    clipped: BlendMode["clipped"];

    /** Opposite of {@link Layer.visible} */
    hidden(): boolean;

    blendingMode(): BlendMode["mode"];

    // Mixin from lib/psd/layer/mask.coffee
    mask: Mask;

    // Mixin from lib/psd/layer/blending_ranges.coffee
    blendingRanges: {
      grey: Layer.BlendingSourceDest;
      channels: Layer.BlendingSourceDest[];
    };

    // Mixin from lib/psd/layer/name.coffee
    /**
     * Every Photoshop document has what we can consider to be the "legacy"
     * name. This used to be the sole place that Photoshop stored the layer
     * name, but once people started using fancy UTF-8 characters, they moved
     * the layer name out into a layer info block. This stayed behind for
     * compatibility reasons. The newer layer name is always preferred since it
     * covers all possible characters (even emojis), while this has a much more
     * limited character set.
     */
    legacyName: string;

    // Mixin from lib/psd/layer/info.coffee
    // TODO: This is too big to add right now. Let's add it later
    // adjustments: {}

    // Mixin from lib/psd/layer/helpers.coffee
    isFolder(): boolean;
    isFolderEnd(): boolean;

    // Mixin from lib/psd/layer/channel_image.coffee
    image: ChannelImage;

    get name(): string;

    // TODO: Finish this!

    // Properties set by Node constructor (lib/psd/node.coffee)
    node?: NodeChildren;
  }

  namespace Layer {
    // Part of lib/psd/layer/blending_ranges.coffee
    interface BlendingSourceDest {
      source: {
        black: [number, number];
        white: [number, number];
      };
      dest: {
        black: [number, number];
        white: [number, number];
      };
    }
  }

  // lib/psd/layer_mask.coffee
  /**
   * The layer mask is the overarching data structure that describes both the
   * layers/groups in the PSD document, and the global mask.
   * This part of the document is ordered as such:
   *
   * * Layers
   * * Layer images
   * * Global Mask
   *
   * The file does not need to have a global mask. If there is none, then its
   * length will be zero.
   */
  interface LayerMask {
    // TODO: Finish this
    layers: Layer[];
  }

  type NodeChildren = Node.Group | Node.Layer;
  type NodeParent = Node.Group | Node.Root;
  type NodeType = "node" | "layer" | "group" | "root";

  // lib/psd/node.coffee
  /**
   * The Node abstraction is one of the most important in PSD.js. It's the base
   * for the tree representation of the document structure. Every layer and
   * group is a node in the document tree. All common functionality is here, and
   * both layers and groups extend this class with specialized functionality.
   *
   * While you can access the layer data directly, the Node interface provides a
   * somewhat higher-level API that makes it easier and less verbose to access
   * the wealth of information that's stored in each PSD.
   */
  interface Node {
    // Mixin from lib/psd/nodes/ancestry.coffee
    root(): Node.Root;
    isRoot(): boolean;
    children(): NodeChildren[];
    ancestors(): NodeParent[];
    hasChildren(): boolean;
    childless(): boolean;
    siblings(): NodeChildren[];
    nextSibling(): NodeChildren | null;
    prevSibling(): NodeChildren | null;
    hasSiblings(): boolean;
    onlyChild(): boolean;
    descendants(): NodeChildren[];
    subtree(): NodeChildren[];
    depth(): number;
    path(asArray?: boolean): string;

    // Mixin from lib/psd/nodes/search.coffee
    childrenAtPath(
      path: string | string[],
      opts?: {
        caseSensitive?: boolean;
      }
    ): NodeChildren[];

    // Mixin from lib/psd/nodes/build_preview.coffee
    // (shimmed with shims/png.coffee)
    toBase64(): string;
    toPng(): HTMLImageElement;

    type: NodeType;

    layer: Layer;
    parent: NodeParent | null;
    name: string;
    forceVisible: null;
    coords: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    topOffset: number;
    leftOffset: number;

    /** The getter for this field returns `coords.top + topOffset`. */
    get top(): number;
    /** The setter for this field returns `coords.top`. */
    set top(value: number);

    /** The getter for this field returns `coords.right + leftOffset`. */
    get right(): number;
    /** The setter for this field returns `coords.right`. */
    set right(value: number);

    /** The getter for this field returns `coords.bottom + topOffset`. */
    get bottom(): number;
    /** The setter for this field returns `coords.bottom`. */
    set bottom(value: number);

    /** The getter for this field returns `coords.left + leftOffset`. */
    get left(): number;
    /** The setter for this field returns `coords.left`. */
    set left(value: number);

    get width(): number;
    get height(): number;

    /**
     * **All properties should be accessed through `get()`**. While many
     * things can be accessed without it, using `get()` provides 2 things:
     *
     * * Consistency
     * * Access to both data on the Node and the Layer through the same
     *   interface.
     *
     * This makes it much cleaner to access stuff like layer info blocks,
     * since you just give the name of the block you want to access. For
     * example:
     *
     * ```js
     * node.get('typeTool').export();
     *
     * // vs
     *
     * node.layer.typeTool().export();
     * ```
     */
    get(prop: string): any;

    /**
     * Is this layer/group visible? This checks all possible places that could
     * define whether or not this is true, e.g. clipping masks. It also checks
     * the current layer comp visibility override (not implemented yet).
     */
    visible(): boolean;

    /** Opposite of `visible()` */
    hidden(): boolean;

    isLayer(): boolean;
    isGroup(): boolean;

    /**
     * Retrieves the clipping mask for this node. Because a clipping mask can
     * be applied to multiple layers, we have to traverse the tree until we
     * find the first node that does not have the `clipped` flag. We can do it
     * this way because all layers that the clipping node affects must be
     * siblings and in sequence.
     */
    clippingMask(): any | null;

    /** Alias of {@link clippingMask()} */
    clippedBy(): any | null;

    /**
     * Export the most important information about this node as a plain
     * object.
     * If we're exporting a group, it will recursively export itself and all
     * of it's descendants as well.
     */
    export(): unknown;
  }

  interface NodeExport {
    type: Node["type"];
    visible: boolean;
    opacity: number;
    blendingMode: ReturnType<Layer["blendingMode"]>;
    name: string;
    left: number;
    right: number;
    top: number;
    bottom: number;
    height: number;
    width: number;
  }

  namespace Node {
    // lib/psd/nodes/group.coffee
    interface Group extends Node {
      parent: NodeParent;

      type: "group";
      passthruBlending(): boolean;
      isEmpty(): boolean;
      export(): GroupExport;
    }

    interface GroupExport extends NodeExport {
      type: "group";
      children: ChildrenExport[];
    }

    // lib/psd/nodes/layer.coffee
    // (not to be confused with PSD.Layer)
    interface Layer extends Node {
      parent: NodeParent;

      type: "layer";
      isEmpty(): boolean;
      export(): LayerExport;
    }

    interface LayerExport extends NodeExport {
      type: "layer";
      mask: MaskExport;
      text: any;
      image: EmptyObject;
    }

    // lib/psd/nodes/root.coffee
    interface Root extends Node {
      parent: null;

      type: "root";

      psd: PSD;

      documentDimensions(): [width: number, height: number];

      depth(): 0;
      opacity(): 255;
      fillOpacity(): 255;

      export(): RootExport;
    }

    interface RootExport {
      children: ChildrenExport[];
      document: {
        width: number;
        height: number;
        resources: {
          layerComps: any;
          resolutionInfo: any;
          guides: any;
          slices: []; // Seems to be non-functional?
        };
      };
    }
  }
}

// lib/psd/blend_mode.coffee
type BlendModeKey =
  | "norm"
  | "dark"
  | "lite"
  | "hue"
  | "sat"
  | "colr"
  | "lum"
  | "mul"
  | "scrn"
  | "diss"
  | "over"
  | "hLit"
  | "sLit"
  | "diff"
  | "smud"
  | "div"
  | "idiv"
  | "lbrn"
  | "lddg"
  | "vLit"
  | "lLit"
  | "pLit"
  | "hMix"
  | "pass"
  | "dkCl"
  | "lgCl"
  | "fsub"
  | "fdiv";

// lib/psd/blend_mode.coffee
type BlendModeName =
  | "normal"
  | "darken"
  | "lighten"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity"
  | "multiply"
  | "screen"
  | "dissolve"
  | "overlay"
  | "hard_light"
  | "soft_light"
  | "difference"
  | "exclusion"
  | "color_dodge"
  | "color_burn"
  | "linear_burn"
  | "linear_dodge"
  | "vivid_light"
  | "linear_light"
  | "pin_light"
  | "hard_mix"
  | "passthru"
  | "darker_color"
  | "lighter_color"
  | "subtract"
  | "divide";

// lib/psd/blend_mode.coffee
interface BlendMode {
  /** The 4 character key for the blending mode. */
  blendKey: BlendModeKey;
  /** The opacity of the layer, from [0, 255]. */
  opacity: number;
  /** Raw value for the clipping state of this layer. */
  clipping: number;
  /** Is this layer a clipping mask? */
  clipped: boolean;
  flags: number;
  /** The readable representation of the blend mode. */
  mode: BlendModeName;
  /** Is this layer visible? */
  visible: boolean;
  /** Returns the layer opacity as a percentage. */
  opacityPercentage(): number;
}

// lib/psd/mask.coffee
/**
 * Each layer/group in the PSD document can have a mask, which is represented
 * by this class. The mask describes which parts of the layer are visible and
 * which are hidden.
 */
interface Mask {
  top: number;
  right: number;
  bottom: number;
  left: number;
  size: number;

  width: number;
  height: number;

  relative: boolean;
  disabled: boolean;
  invert: boolean;

  defaultColor: number;
  flags: number;

  export(): MaskExport;
}

interface MaskExport {
  top: Mask["top"];
  left: Mask["left"];
  bottom: Mask["bottom"];
  right: Mask["right"];
  width: Mask["width"];
  height: Mask["height"];
  defaultColor: Mask["defaultColor"];
  relative: Mask["relative"];
  disabled: Mask["disabled"];
  invert: Mask["invert"];
}

type EmptyObject = Record<string, never>;
