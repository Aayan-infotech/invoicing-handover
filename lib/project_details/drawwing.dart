import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'dart:io' show Platform;



class DrawingsScreen extends StatelessWidget {
  const DrawingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
       forceMaterialTransparency:true,
        elevation: 0,
        title: const Text(
          'Drawings',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        leading: _buildPlatformBackButton(context),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Lorem ipsum',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 20),
              _buildCheckerboardImage(),
              const SizedBox(height: 16),
              const Text(
                'Curabitur tempor quis eros tempus lacinia. Nam bibendum pellentesque quam a convallis. Sed ut vulputate nisi. Integer in felis sed leo vestibulum venenatis. Suspendisse quis arcu sem. Aenean feug',
                style: TextStyle(
                  fontSize: 16,
                  height: 1.5,
                  color: Color(0xFF4A4A4A),
                ),
              ),
              const SizedBox(height: 16),
              _buildCheckerboardImage(),
              const SizedBox(height: 16),
              const Text(
                'Curabitur tempor quis eros tempus lacinia. Nam bibendum pellentesque quam a convallis. Sed ut vulputate nisi. Integer in felis sed leo vestibulum venenatis. Suspendisse quis arcu sem. Aenean feug',
                style: TextStyle(
                  fontSize: 16,
                  height: 1.5,
                  color: Color(0xFF4A4A4A),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlatformBackButton(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoButton(
        padding: EdgeInsets.zero,
        child: const Icon(
          CupertinoIcons.back,
          color: Colors.black,
        ),
        onPressed: () => Navigator.of(context).pop(),
      );
    } else {
      return IconButton(
        icon: const Icon(
          Icons.arrow_back,
          color: Colors.black,
        ),
        onPressed: () => Navigator.of(context).pop(),
      );
    }
  }

  Widget _buildCheckerboardImage() {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
      ),
      child: CustomPaint(
        painter: CheckerboardPainter(),
      ),
    );
  }
}

class CheckerboardPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const int squaresPerRow = 12;
    final double squareSize = size.width / squaresPerRow;
    
    Paint lightPaint = Paint()
      ..color = const Color(0xFFF0F0F0);
    
    Paint darkPaint = Paint()
      ..color = const Color(0xFFE0E0E0);
    
    for (int i = 0; i < squaresPerRow; i++) {
      for (int j = 0; j < (size.height / squareSize).ceil(); j++) {
        final bool isEvenSum = (i + j) % 2 == 0;
        final Rect rect = Rect.fromLTWH(
          i * squareSize, 
          j * squareSize, 
          squareSize, 
          squareSize
        );
        
        canvas.drawRect(rect, isEvenSum ? lightPaint : darkPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}