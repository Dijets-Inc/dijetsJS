"use strict";
/**
 * @packageDocumentation
 * @module PlatformVM-Interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vaW50ZXJmYWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgUGxhdGZvcm1WTS1JbnRlcmZhY2VzXG4gKi9cblxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBQZXJzaXN0YW5jZU9wdGlvbnMgfSBmcm9tIFwic3JjL3V0aWxzL3BlcnNpc3RlbmNlb3B0aW9uc1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLlwiXG5pbXBvcnQgeyBVVFhPU2V0IH0gZnJvbSBcIi4uL3BsYXRmb3Jtdm0vdXR4b3NcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEdldFN0YWtlUGFyYW1zIHtcbiAgYWRkcmVzc2VzOiBzdHJpbmdbXVxuICBlbmNvZGluZzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0U3Rha2VSZXNwb25zZSB7XG4gIHN0YWtlZDogQk5cbiAgc3Rha2VkT3V0cHV0czogVHJhbnNmZXJhYmxlT3V0cHV0W11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRSZXdhcmRVVFhPc1BhcmFtcyB7XG4gIHR4SUQ6IHN0cmluZ1xuICBlbmNvZGluZzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0UmV3YXJkVVRYT3NSZXNwb25zZSB7XG4gIG51bUZldGNoZWQ6IG51bWJlclxuICB1dHhvczogc3RyaW5nW11cbiAgZW5jb2Rpbmc6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldFZhbGlkYXRvcnNBdFBhcmFtcyB7XG4gIGhlaWdodDogbnVtYmVyXG4gIHN1Ym5ldElEPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0VmFsaWRhdG9yc0F0UmVzcG9uc2Uge1xuICB2YWxpZGF0b3JzOiBvYmplY3Rcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRDdXJyZW50VmFsaWRhdG9yc1BhcmFtcyB7XG4gIHN1Ym5ldElEPzogQnVmZmVyIHwgc3RyaW5nXG4gIG5vZGVJRHM/OiBzdHJpbmdbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNhbXBsZVZhbGlkYXRvcnNQYXJhbXMge1xuICBzaXplOiBudW1iZXIgfCBzdHJpbmdcbiAgc3VibmV0SUQ/OiBCdWZmZXIgfCBzdHJpbmcgfCB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTYW1wbGVWYWxpZGF0b3JzUGFyYW1zIHtcbiAgc2l6ZTogbnVtYmVyIHwgc3RyaW5nXG4gIHN1Ym5ldElEPzogQnVmZmVyIHwgc3RyaW5nIHwgdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWRkVmFsaWRhdG9yUGFyYW1zIHtcbiAgdXNlcm5hbWU6IHN0cmluZ1xuICBwYXNzd29yZDogc3RyaW5nXG4gIG5vZGVJRDogc3RyaW5nXG4gIHN0YXJ0VGltZTogbnVtYmVyXG4gIGVuZFRpbWU6IG51bWJlclxuICBzdGFrZUFtb3VudDogc3RyaW5nXG4gIHJld2FyZEFkZHJlc3M6IHN0cmluZ1xuICBkZWxlZ2F0aW9uRmVlUmF0ZT86IHN0cmluZyB8IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFkZERlbGVnYXRvclBhcmFtcyB7XG4gIHVzZXJuYW1lOiBzdHJpbmdcbiAgcGFzc3dvcmQ6IHN0cmluZ1xuICBub2RlSUQ6IHN0cmluZ1xuICBzdGFydFRpbWU6IG51bWJlclxuICBlbmRUaW1lOiBudW1iZXJcbiAgc3Rha2VBbW91bnQ6IHN0cmluZ1xuICByZXdhcmRBZGRyZXNzOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRQZW5kaW5nVmFsaWRhdG9yc1BhcmFtcyB7XG4gIHN1Ym5ldElEPzogQnVmZmVyIHwgc3RyaW5nXG4gIG5vZGVJRHM/OiBzdHJpbmdbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4cG9ydERKVFhQYXJhbXMge1xuICB1c2VybmFtZTogc3RyaW5nXG4gIHBhc3N3b3JkOiBzdHJpbmdcbiAgYW1vdW50OiBzdHJpbmdcbiAgdG86IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEltcG9ydERKVFhQYXJhbXMge1xuICB1c2VybmFtZTogc3RyaW5nXG4gIHBhc3N3b3JkOiBzdHJpbmdcbiAgc291cmNlQ2hhaW46IHN0cmluZ1xuICB0bzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwb3J0S2V5UGFyYW1zIHtcbiAgdXNlcm5hbWU6IHN0cmluZ1xuICBwYXNzd29yZDogc3RyaW5nXG4gIGFkZHJlc3M6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEltcG9ydEtleVBhcmFtcyB7XG4gIHVzZXJuYW1lOiBzdHJpbmdcbiAgcGFzc3dvcmQ6IHN0cmluZ1xuICBwcml2YXRlS2V5OiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRCYWxhbmNlUmVzcG9uc2Uge1xuICBiYWxhbmNlOiBCTiB8IG51bWJlclxuICB1bmxvY2tlZDogQk4gfCBudW1iZXJcbiAgbG9ja2VkU3Rha2VhYmxlOiBCTiB8IG51bWJlclxuICBsb2NrZWROb3RTdGFrZWFibGU6IEJOIHwgbnVtYmVyXG4gIHV0eG9JRHM6IHtcbiAgICB0eElEOiBzdHJpbmdcbiAgICBvdXRwdXRJbmRleDogbnVtYmVyXG4gIH1bXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUFkZHJlc3NQYXJhbXMge1xuICB1c2VybmFtZTogc3RyaW5nXG4gIHBhc3N3b3JkOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMaXN0QWRkcmVzc2VzUGFyYW1zIHtcbiAgdXNlcm5hbWU6IHN0cmluZ1xuICBwYXNzd29yZDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhcnRJbmRleCB7XG4gIGFkZHJlc3M6IHN0cmluZ1xuICB1dHhvOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRVVFhPc1BhcmFtcyB7XG4gIGFkZHJlc3Nlczogc3RyaW5nW10gfCBzdHJpbmdcbiAgc291cmNlQ2hhaW4/OiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgbGltaXQ6IG51bWJlciB8IDBcbiAgc3RhcnRJbmRleD86IFN0YXJ0SW5kZXggfCB1bmRlZmluZWRcbiAgcGVyc2lzdE9wdHM/OiBQZXJzaXN0YW5jZU9wdGlvbnMgfCB1bmRlZmluZWRcbiAgZW5jb2Rpbmc/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbmRJbmRleCB7XG4gIGFkZHJlc3M6IHN0cmluZ1xuICB1dHhvOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRVVFhPc1Jlc3BvbnNlIHtcbiAgbnVtRmV0Y2hlZDogbnVtYmVyXG4gIHV0eG9zOiBVVFhPU2V0XG4gIGVuZEluZGV4OiBFbmRJbmRleFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZVN1Ym5ldFBhcmFtcyB7XG4gIHVzZXJuYW1lOiBzdHJpbmdcbiAgcGFzc3dvcmQ6IHN0cmluZ1xuICBjb250cm9sS2V5czogc3RyaW5nW11cbiAgdGhyZXNob2xkOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdWJuZXQge1xuICBpZHM6IHN0cmluZ1xuICBjb250cm9sS2V5czogc3RyaW5nW11cbiAgdGhyZXNob2xkOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVCbG9ja2NoYWluUGFyYW1zIHtcbiAgdXNlcm5hbWU6IHN0cmluZ1xuICBwYXNzd29yZDogc3RyaW5nXG4gIHN1Ym5ldElEPzogQnVmZmVyIHwgc3RyaW5nIHwgdW5kZWZpbmVkXG4gIHZtSUQ6IHN0cmluZ1xuICBmeElEczogbnVtYmVyW11cbiAgbmFtZTogc3RyaW5nXG4gIGdlbmVzaXNEYXRhOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCbG9ja2NoYWluIHtcbiAgaWQ6IHN0cmluZ1xuICBuYW1lOiBzdHJpbmdcbiAgc3VibmV0SUQ6IHN0cmluZ1xuICB2bUlEOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRUeFN0YXR1c1BhcmFtcyB7XG4gIHR4SUQ6IHN0cmluZ1xuICBpbmNsdWRlUmVhc29uPzogYm9vbGVhbiB8IHRydWVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRUeFN0YXR1c1Jlc3BvbnNlIHtcbiAgc3RhdHVzOiBzdHJpbmdcbiAgcmVhc29uOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRNaW5TdGFrZVJlc3BvbnNlIHtcbiAgbWluVmFsaWRhdG9yU3Rha2U6IEJOXG4gIG1pbkRlbGVnYXRvclN0YWtlOiBCTlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldE1heFN0YWtlQW1vdW50UGFyYW1zIHtcbiAgc3VibmV0SUQ/OiBzdHJpbmdcbiAgbm9kZUlEOiBzdHJpbmdcbiAgc3RhcnRUaW1lOiBCTlxuICBlbmRUaW1lOiBCTlxufVxuIl19