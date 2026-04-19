import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "triXope.FilmAuteur_LTXV.Groups",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FilmAuteur_LTXV") {
            
            // --- Keeps save files pure ---
            const onSerialize = nodeType.prototype.onSerialize;
            nodeType.prototype.onSerialize = function(o) {
                if (onSerialize) onSerialize.apply(this, arguments);
                if (this.widgets && o.widgets_values) {
                    let cleanValues = [];
                    for (let i = 0; i < this.widgets.length; i++) {
                        if (!this.widgets[i].isCustomGrouperBtn) {
                            cleanValues.push(o.widgets_values[i]);
                        }
                    }
                    o.widgets_values = cleanValues;
                }
            };

            // --- RESTORES SAVED HEIGHT ---
            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function(o) {
                if (onConfigure) onConfigure.apply(this, arguments);
                // Stash the exact size from the JSON save file before any layout math messes with it
                if (o.size) {
                    this._true_saved_size = [o.size[0], o.size[1]];
                }
            };

            const onNodeCreated = nodeType.prototype.onNodeCreated;

            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                this.properties = this.properties || {};

                const groupDefinitions = [
                    { btnName: "grp_input_controls", label: "Input", widgets: ["bypass_img_ref", "bypass_first_frame", "load_audio_from_file", "bypass_audio_ref", "image_ref_str", "first_frame_str", "identity_guidance_scale"] },
                    { btnName: "grp_ollama_enhance", label: "Enhance", widgets: ["use_ollama", "ollama_url", "ollama_model"] },
                    { btnName: "grp_timeline_controls", label: "Timeline", widgets: ["noise_seed", "control_after_generate", "target_width", "target_height", "length_in_seconds", "frame_rate"] },
                    { btnName: "grp_sampling", label: "Sampling", widgets: ["sampling_stages", "primary_sampler_name", "primary_cfg", "primary_steps", "upsample_sampler_name", "upsample_cfg", "upsample_manual_sigmas", "eta", "bongmath", "autoregressive_chunking", "chunk_size_seconds", "context_window_seconds"] },
                    { btnName: "grp_refinement", label: "Refinement", widgets: ["temporal_upscale", "restore_faces", "facerestore_model", "facedetection", "codeformer_fidelity", "face_restore_color_match", "face_restore_edge_blur", "face_restore_blend"] },
                    { btnName: "grp_vram_optimization", label: "VRAM", widgets: ["enable_fp16_accumulation", "sage_attention", "chunks"] }
                ];

                const WIDGET_TOOLTIPS = {
                    "bypass_img_ref": "Bypass the image reference.",
                    "bypass_first_frame": "Bypass the first frame (for image-to-video).",
                    "load_audio_from_file": "Load audio from a file source.",
                    "bypass_audio_ref": "Ignores the audio_ref input.",
                    "image_ref_str": "Strength of the image_ref batch. Values over 1.0 may cause artifacts or burning.",
                    "identity_guidance_scale": "Strength of identity guidance for ID-LoRA.",
                    "use_ollama": "Use local Ollama to visually describe inputs and revamp the prompt.",
                    "length_in_seconds": "Total video length in seconds. Note: length_in_seconds must be evenly divisible by total number of shots.",
                    "sampling_stages": "Number of processing stages. 1 = No upscale, 2 = One 2x upscale pass, 3 = Two 2x upscale passes (4x total).",
                    "primary_steps": "Enter a single number for steps (e.g., 20), or a comma-separated list for manual sigmas (e.g., 1.0, 0.8, 0.0).",
                    "eta": "Calculated noise amount to be added, then removed, after each step.",
                    "bongmath": "Injects BONGMATH parameter into extra_options to act exactly as ClownSampler does for RES4LYF nodes.",
                    "autoregressive_chunking": "Automatically flush VRAM and outpaint the video in chunks if the length exceeds the chunk size.",
                    "chunk_size_seconds": "The max duration (in seconds) generated in a single pass before flushing VRAM.",
                    "context_window_seconds": "Seconds of previous video the model can 'see'. Caps render time! Set equal to chunk_size to keep rendering times perfectly flat.",
                    "temporal_upscale": "Triggers the temporal upscaler on or off (use to double the input frame rate, thus doubling the frame count, and refine the final video, cleaning up artifacts).",
                    "restore_faces": "Apply CodeFormer face restoration to all frames. Requires a valid model selected below.",
                    "facerestore_model": "Select the CodeFormer Face Restore Model.",
                    "facedetection": "Face detection model.",
                    "codeformer_fidelity": "Balance between quality and identity. 0 is high quality, 1 is high fidelity.",
                    "face_restore_color_match": "Automatically match the hue, saturation, and luminance of the restored face to the original degraded face.",
                    "face_restore_edge_blur": "Apply a soft alpha feathering to the edges of the restored face before pasting to eliminate harsh boundary lines.",
                    "face_restore_blend": "Opacity of the restored face. Lower values significantly reduce video flickering by anchoring to the original frame.",
                    "enable_fp16_accumulation": "Enable torch.backends.cuda.matmul.allow_fp16_accumulation.",
                    "sage_attention": "Patch comfy attention to use sageattn.",
                    "chunks": "Number of chunks to split the feedforward activations into to reduce peak VRAM usage.",
                    "stage_1_preview": "Enable or disable the animated preview after the first processing stage.",
                };

                const toggleWidget = (w, visible) => {
                    if (!w) return;
                    if (w.type === "converted-widget") return; // Respect actual wired inputs

                    w.hidden = !visible;
                    if (w.element) w.element.style.display = visible ? "" : "none";
                    if (w.inputEl) w.inputEl.style.display = visible ? "" : "none";

                    if (visible) {
                        if (w.hasOwnProperty('origComputeSize')) {
                            w.computeSize = w.origComputeSize;
                        } else {
                            delete w.computeSize; 
                        }
                        w.tooltip = WIDGET_TOOLTIPS[w.name] || "";
                    } else {
                        if (!w.hasOwnProperty('origComputeSize')) {
                            w.origComputeSize = w.hasOwnProperty('computeSize') ? w.computeSize : undefined;
                        }
                        w.computeSize = () => [0, 0];
                        
                        // THE FIX: Destroy the cached layout coordinates. 
                        // If these are undefined, ComfyUI physically cannot draw the connection dot.
                        w.y = undefined;
                        w.last_y = undefined;
                        
                        w.tooltip = null; 
                    }
                };

                setTimeout(() => {
                    for (let def of groupDefinitions) {
                        let dummyIndex = this.widgets.findIndex(w => w.name === def.btnName);
                        
                        if (dummyIndex !== -1) {
                            let dummyWidget = this.widgets[dummyIndex];
                            toggleWidget(dummyWidget, false); // Nuke the dummy header's dot

                            let propKey = "groupState_" + def.btnName;
                            if (this.properties[propKey] === undefined) {
                                this.properties[propKey] = false; 
                            }
                            let isExpanded = this.properties[propKey];

                            let btn = this.addWidget("button", (isExpanded ? "▼ " : "▶ ") + def.label, null, () => {
                                let oldMinY = this.computeSize()[1]; 

                                isExpanded = !isExpanded;
                                this.properties[propKey] = isExpanded; 
                                btn.name = (isExpanded ? "▼ " : "▶ ") + def.label;
                                
                                for (let wName of def.widgets) {
                                    let targetW = this.widgets.find(w => w.name === wName);
                                    toggleWidget(targetW, isExpanded);
                                }
                                
                                let newMinSize = this.computeSize();
                                let deltaY = newMinSize[1] - oldMinY;
                                
                                this.setSize([
                                    Math.max(this.size[0], newMinSize[0]), 
                                    Math.max(newMinSize[1], this.size[1] + deltaY) 
                                ]);
                                
                                app.graph.setDirtyCanvas(true, true);
                            });

                            btn.isCustomGrouperBtn = true;

                            this.widgets.pop(); 
                            this.widgets.splice(dummyIndex, 0, btn);

                            for (let wName of def.widgets) {
                                let targetW = this.widgets.find(w => w.name === wName);
                                toggleWidget(targetW, isExpanded);
                            }
                        }
                    }
                    
                    let bootMinSize = this.computeSize();
                    let finalW = this.size[0];
                    let finalH = this.size[1];

                    if (this._true_saved_size) {
                        finalW = this._true_saved_size[0];
                        finalH = this._true_saved_size[1];
                        delete this._true_saved_size; 
                    }

                    this.setSize([
                        Math.max(bootMinSize[0], finalW), 
                        Math.max(bootMinSize[1], finalH)
                    ]);
                    
                    app.graph.setDirtyCanvas(true, true);
                    
                }, 250); 

                return r;
            };
        }
    }
});

// --- DYNAMIC NATIVE MP4 PREVIEW RECEIVER ---
api.addEventListener("trixope_ltxv_preview", (event) => {
    const data = event.detail;
    const node = app.graph.getNodeById(data.node);
    
    if (node) {
        let previewWidget = node.widgets && node.widgets.find(w => w.name === "stage1_preview");
        
        if (!previewWidget) {
            const videoEl = document.createElement("video");
            videoEl.style.width = "100%";
            videoEl.style.objectFit = "contain";
            videoEl.controls = true; 
            videoEl.autoplay = true;
            videoEl.loop = true;
            
            previewWidget = node.addDOMWidget("stage1_preview", "preview", videoEl, {
                serialize: false,
                hideOnZoom: false
            });

            previewWidget.computeSize = function(width) {
                let height = (width * 9) / 16; 
                
                if (this.element && this.element.videoWidth > 0) {
                    const ratio = this.element.videoHeight / this.element.videoWidth;
                    height = width * ratio;
                }
                
                this.element.style.height = height + "px";
                return [width, height + 10]; 
            };

            const origOnResize = node.onResize;
            node.onResize = function(size) {
                if (origOnResize) origOnResize.apply(this, arguments);
                if (previewWidget.element) {
                    let ratio = 9 / 16;
                    if (previewWidget.element.videoWidth > 0) {
                        ratio = previewWidget.element.videoHeight / previewWidget.element.videoWidth;
                    }
                    previewWidget.element.style.height = (size[0] * ratio) + "px";
                }
            };
            
            const origOnRemoved = node.onRemoved;
            node.onRemoved = function() {
                if (origOnRemoved) origOnRemoved.apply(this, arguments);
                if (previewWidget.element) {
                    previewWidget.element.pause();
                    previewWidget.element.removeAttribute('src');
                    previewWidget.element.load();
                }
            };
        }
        
        previewWidget.element.src = api.apiURL(`/view?filename=${data.filename}&type=${data.type}&t=${Date.now()}`);
        
        previewWidget.element.onloadedmetadata = () => {
            const currentWidth = node.size[0];
            const idealSize = node.computeSize([currentWidth, node.size[1]]);
            
            node.setSize([currentWidth, idealSize[1]]);
            app.graph.setDirtyCanvas(true, true);
        };
        
        previewWidget.element.play().catch(e => console.warn("Video autoplay blocked by browser: ", e));
    }
});
