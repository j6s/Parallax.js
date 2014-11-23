/**
 * Simple parallax. In contrast to most other parallaxes, this one moves a
 * background image, not the Element itself
 *
 * @author Johannes Hertenstein ~ thephpjo
 * @param cfg
 * {
 *      element:      - DOM Node (native, not jQuery!)
 *      startOffset:  - offset, should be negative: Translates exactly to the backgroundposition
 *                      of the image, if element is at the top of the screen
 *      distance:     - Traveldistance of the background image in Pixel. The image will move this much
 *                      during scrolling past the user
 *      start:        - If you want to start the parallax to start sooner or later, give a offset (in pixel) here
 *      stop:         - If you want to start the parallax to start sooner or later, give a offset (in pixel) here
 *      breakpoint:   - It will only parallax for devices larger than the breakpoint
 *      throttling:   - the amount of throtteling applied. Higher numbers = better performance on low-end devices
 *                      but worse framerate on high-end devices
 *      cssTrans      - applies a CSS Transition to smooth out the motion. Best used in combination with high throtteling
 * }
 * @constructor
 */
function Parallax(cfg) {

    if (!cfg.element) {
        throw "parallax: at least element must be given";
    }

    /**
     * Calculating the correct starting and stopping points
     */
    cfg.start = cfg.start || 0;
    cfg.stop =  cfg.stop  || 0;

    cfg.start = cfg.element.offsetTop - window.innerHeight + cfg.start;
    cfg.stop  = cfg.element.offsetTop + cfg.element.offsetHeight;

    /**
     * Write configuration to object
     */
    this.element =      cfg.element;
    this.startOffset =  cfg.startOffset || 0;
    this.distance =     cfg.distance || 200;
    this.start =        cfg.start;
    this.stop =         cfg.stop;
    this.breakpoint =   cfg.breakpoint || 1024;
    this.throttling =   cfg.throttling || 15;
    this.cssTrans =     cfg.cssTrans || false;

    /**
     * debounced Version of the parallax function. This will get registered as the event listener
     */
    this.registerMe = helpers.throttle(this.parallax,this.throttling,this);

    this.init();
}

Parallax.prototype = {

    /**
     * Init function: gets called, when Object is created
     */
    init: function(){
        this.handleRegisters();
        /**
         * brings everything to the startOffset position
         */
        this.element.style.backgroundPosition = "center " + this.startOffset + "px";

        if(this.cssTrans){
            this.element.style.transition = "background-position: "+(1/this.throttling)+"s";
        }
        /**
         * parallax once: This brings the elements, that are on screen on load in the right position
         */
        this.parallax();
    },

    /**
     * If the element is inside our start & stop bounds, we parallax
     */
    parallax: function () {
        var absoluteOffset = window.pageYOffset;
        if (absoluteOffset > this.start && absoluteOffset < this.stop) {
            this.doMovement();
        }
    },

    /**
     * the parallaxing movement function itself.
     * It sets the position of the background
     */
    doMovement: function(){
        var relativeOffset = window.pageYOffset;
        if(this.element.offsetTop < window.innerHeight){
            relativeOffset += this.element.offsetTop;
        }
        var offset = this.startOffset - this.getOffsetPercentage() * this.distance;
        this.element.style.backgroundPosition = "center " + offset + "px";
    },

    /**
     * element's lower edge is past the upper edge of the screen: 0
     * element's top edge is past the lower edge of the screen: 1
     */
    getOffsetPercentage: function(){
        var scrollTop =     window.pageYOffset;
        var height =        this.element.offsetHeight;
        var windowHeight =  window.innerHeight;
        var offsetTop =     this.element.offsetTop;

        var lowerBound =    offsetTop + height;
        var upperBound =    offsetTop - windowHeight;
        var range =         upperBound - lowerBound;

        return (scrollTop - lowerBound) / range;
    },

    /**
     * registers the scroll handler on the throttled version of parallax
     */
    register: function () {
        window.addEventListener("scroll", this.registerMe);
    },

    /**
     * unregisters the scroll handler
     */
    unregister: function () {
        window.removeEventListener("scroll",this.registerMe);
    },

    /**
     * Handles event handler registration depending on window size
     */
    handleRegisters: function(){
        var self = this;

        var handler = function(){
            if(window.innerWidth > self.breakpoint){
                self.register();
            } else {
                self.unregister();
            }
        }

        handler();

        window.addEventListener("resize",helpers.debounce(handler,250,this));
    }
}
