@echo off
rem author: leio
rem date: 2019/11/5
rem desc: first npm install . 

set compiler=node_modules/google-closure-compiler/compiler.jar
set closure_library=node_modules/google-closure-library

echo Using %compiler% as the compiler.
echo Compiling Scratch-Blocks..

call java -jar %compiler% ^
  --js='core/**.js' ^
  --js='!core/block_render_svg_horizontal.js' ^
  --js='%closure_library%/closure/goog/**.js' ^
  --js='%closure_library%/third_party/closure/goog/**.js' ^
  --generate_exports ^
  --warning_level='DEFAULT' ^
  --compilation_level SIMPLE_OPTIMIZATIONS ^
  --dependency_mode=STRICT ^
  --entry_point=Blockly ^
  --js_output_file blockly_compressed_vertical.js

echo Compilation OK.
exit /b 0
