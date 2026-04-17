import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "triXope.FilmAuteur_LTXV.Groups",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FilmAuteur_LTXV") {
            
            // --- NaN SHIFT FIX: Keeps the save file pure ---
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

                // --- YOUR BRILLIANT TOOLTIP ARCHITECTURE ---
                // Define all tooltips here in JS. The script will inject and annihilate them dynamically!
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
                };

                const toggleWidget = (w, visible) => {
                    if (!w) return;

                    // --- THE PLUG FIX ---
                    // If the user converted this widget to an input plug, ignore it. 
                    // This lets ComfyUI natively manage the wire anchors without layout interference!
                    if (w.type === "converted-widget") return;

                    w.hidden = !visible;
                    if (w.element) w.element.style.display = visible ? "" : "none";
                    if (w.inputEl) w.inputEl.style.display = visible ? "" : "none";

                    if (visible) {
                        if (w.hasOwnProperty('origComputeSize')) {
                            w.computeSize = w.origComputeSize;
                        } else {
                            delete w.computeSize; 
                        }
                        
                        // INJECT TOOLTIP
                        w.tooltip = WIDGET_TOOLTIPS[w.name] || "";
                        
                    } else {
                        if (!w.hasOwnProperty('origComputeSize')) {
                            w.origComputeSize = w.hasOwnProperty('computeSize') ? w.computeSize : undefined;
                        }
                        w.computeSize = () => [0, 0];
                        
                        // ANNIHILATE TOOLTIP
                        w.tooltip = null; 
                    }
                };

                setTimeout(() => {
                    for (let def of groupDefinitions) {
                        let dummyIndex = this.widgets.findIndex(w => w.name === def.btnName);
                        
                        if (dummyIndex !== -1) {
                            let dummyWidget = this.widgets[dummyIndex];
                            toggleWidget(dummyWidget, false);

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
